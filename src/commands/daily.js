const { SlashCommandBuilder } = require('discord.js');
const { ContainerBuilder, SectionBuilder, TextDisplayBuilder, SeparatorBuilder, buildError } = require('../utils/uiBuilders');
const User = require('../database/User');
const { getEmoji } = require('../utils/emojiManager');

const PRIMARY_GUILD_ID = '1422969507734884374';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your Hyperion capital distribution.'),
    async execute(interaction) {
        if (interaction.guildId !== PRIMARY_GUILD_ID) {
            return interaction.reply({ ...buildError("This bot only works inside the Hyperion server.").toJSON(), flags: 64 });
        }

        await interaction.deferReply({ flags: 64 });

        let dbUser = await User.getOrCreate(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
        
        if (!dbUser) {
            return interaction.editReply({ ...buildError("Player not identified in Hyperion Database.").toJSON() });
        }

        const now = new Date();
        const cooldown = 24 * 60 * 60 * 1000;
        const lastDaily = dbUser.last_daily ? new Date(dbUser.last_daily) : null;
        
        if (lastDaily && (now.getTime() - lastDaily.getTime()) < cooldown) {
            const remaining = cooldown - (now.getTime() - lastDaily.getTime());
            const hours = Math.floor(remaining / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);
            
            const container = new ContainerBuilder()
                .setAccentColor(0xFF4444)
                .setThumbnail(interaction.user.displayAvatarURL())
                .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`❌ **COOLDOWN ACTIVE**\n` + "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯" + `\nSector: **Daily Capital Distribution**\nStatus: **Denied**\nAuthentication: **Invalid**\n\nRetry authorized in **${hours}h ${minutes}m**.`)));
            return interaction.editReply({ ...container.toJSON() });
        }

        let streak = dbUser.daily_streak || 0;
        if (lastDaily && (now.getTime() - lastDaily.getTime()) > (2 * cooldown)) {
            streak = 0;
        }
        streak += 1;

        const baseReward = 100;
        const bonus = streak * 20;
        const totalReward = baseReward + bonus;

        await User.updateCoins(interaction.user.id, totalReward, 'daily_reward');
        
        await User.save(interaction.user.id, {
            last_daily: now.toISOString(),
            daily_streak: streak
        });

        const container = new ContainerBuilder()
            .setAccentColor(0x2ECC71)
            .setThumbnail(interaction.user.displayAvatarURL())
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`✅ **AUTHENTICATION ACCEPTED**\n` + "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯" + `\nSector: **Capital Distribution**\nCapital: **+${totalReward}** ${getEmoji('COIN')}\n\n🔥 Current Streak: **${streak}** Days`)
            ))
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`\n*Visit the Web Dashboard to track your growth.*`)
            ));
        
        await interaction.editReply(container.toJSON());
    }
};
