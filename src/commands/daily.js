const { SlashCommandBuilder } = require('discord.js');
const { buildPanel, buildError } = require('../utils/uiBuilders');
const User = require('../database/User');
const { getEmoji } = require('../utils/emojiManager');

const PRIMARY_GUILD_ID = '1422969507734884374';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your Hyperion capital distribution.'),

    async execute(interaction) {
        if (interaction.guildId !== PRIMARY_GUILD_ID) {
            return interaction.reply({ ...buildError('This bot only works inside the Hyperion server.').toJSON(), flags: 64 });
        }

        await interaction.deferReply({ flags: 64 });

        const dbUser = await User.getOrCreate(
            interaction.user.id,
            interaction.user.username,
            interaction.user.displayAvatarURL()
        );

        if (!dbUser) {
            return interaction.editReply({ ...buildError('Player not identified in Hyperion Database.').toJSON() });
        }

        const now = new Date();
        const cooldownMs = 24 * 60 * 60 * 1000;
        const lastDaily = dbUser.last_daily ? new Date(dbUser.last_daily) : null;

        if (lastDaily && now.getTime() - lastDaily.getTime() < cooldownMs) {
            const remaining = cooldownMs - (now.getTime() - lastDaily.getTime());
            const hours = Math.floor(remaining / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);

            const cooldownPanel = buildPanel({
                icon: getEmoji('ERROR'),
                title: 'COOLDOWN ACTIVE',
                accentColor: 0xff4444,
                thumbnail: interaction.user.displayAvatarURL(),
                lines: [
                    'Sector: **Daily Capital Distribution**',
                    'Status: **Denied**',
                    'Authentication: **Invalid**',
                    '',
                    `Retry authorized in **${hours}h ${minutes}m**.`
                ]
            });

            return interaction.editReply(cooldownPanel.toJSON());
        }

        let streak = dbUser.daily_streak || 0;
        if (lastDaily && now.getTime() - lastDaily.getTime() > 2 * cooldownMs) {
            streak = 0;
        }
        streak += 1;

        const baseReward = 100;
        const bonusReward = streak * 20;
        const totalReward = baseReward + bonusReward;

        await User.updateCoins(interaction.user.id, totalReward, 'daily_reward');
        await User.save(interaction.user.id, {
            last_daily: now.toISOString(),
            daily_streak: streak
        });

        const successPanel = buildPanel({
            icon: getEmoji('SUCCESS'),
            title: 'AUTHENTICATION ACCEPTED',
            accentColor: 0x2ecc71,
            thumbnail: interaction.user.displayAvatarURL(),
            lines: [
                'Sector: **Capital Distribution**',
                `Capital: **+${totalReward}** ${getEmoji('COIN')}`,
                '',
                `${getEmoji('FIRE')} Current Streak: **${streak}** Days`,
                '',
                '*Visit the Web Dashboard to track your growth.*'
            ]
        });

        await interaction.editReply(successPanel.toJSON());
    }
};
