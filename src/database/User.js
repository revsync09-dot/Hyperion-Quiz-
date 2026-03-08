const supabase = require('./supabase');

const User = {
    // Find a user by their Discord ID
    async findOne(filter) {
        if (filter.discord_id) {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('discord_id', filter.discord_id)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                console.error('[DB] findOne error:', error);
                return null;
            }
            return data;
        }
        return null;
    },

    // Create a new user with the specified Discord ID and information
    async create(userData) {
        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select()
            .single();
        
        if (error) {
            console.error('[DB] create error:', error);
            return null;
        }
        return data;
    },

    // Update user information for a given Discord ID
    async save(discordId, updates) {
        // Find by discord_id since we usually have that
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('discord_id', discordId)
            .select()
            .single();
        
        if (error) {
            console.error('[DB] save error:', error);
            return null;
        }
        return data;
    },

    // Count users that match a filter (useful for ranking)
    async countDocuments(filter = {}) {
        let query = supabase.from('users').select('*', { count: 'exact', head: true });
        
        if (filter.total_points && filter.total_points.$gt !== undefined) {
            query = query.gt('total_points', filter.total_points.$gt);
        }

        const { count, error } = await query;
        if (error) {
            console.error('[DB] countDocuments error:', error);
            return 0;
        }
        return count || 0;
    },

    // List users with sorting and pagination
    async find(filter = {}, sort = {}, skip = 0, limit = 10) {
        let query = supabase.from('users').select('*');

        // Apply sorts from snake_case keys (e.g., total_points: -1)
        for (const [key, value] of Object.entries(sort)) {
            query = query.order(key, { ascending: value === 1 });
        }

        if (skip) query = query.range(skip, skip + limit - 1);
        else if (limit) query = query.limit(limit);

        const { data, error } = await query;
        if (error) {
            console.error('[DB] find error:', error);
            return [];
        }
        return data;
    },

    // Helper to get or create a user by Discord ID
    async getOrCreate(discord_id, username = null, avatar = null) {
        let user = await this.findOne({ discord_id });
        if (!user) {
            user = await this.create({
                discord_id,
                username,
                avatar,
                coins: 0,
                level: 1,
                quiz_wins: 0,
                total_points: 0,
                correct_answers: 0,
                games_played: 0
            });
        } else if (username || avatar) {
            // Update profile if changed
            if (user.username !== username || user.avatar !== avatar) {
              user = await this.save(discord_id, { username, avatar });
            }
        }
        return user;
    },

    // Update coins and create an audit log
    async updateCoins(userId, amount, type) {
        // We need the internal UUID for references in logs
        const user = await this.findOne({ discord_id: userId });
        if (!user) return null;

        const newBalance = (user.coins || 0) + amount;
        
        // Use a transaction-like flow (manual)
        const updatedUser = await this.save(userId, { coins: newBalance });
        
        if (updatedUser) {
          await supabase.from('economy_logs').insert([{
              user_id: user.id,
              type,
              amount,
              created_at: new Date()
          }]);
        }
        
        return updatedUser;
    }
};

module.exports = User;
