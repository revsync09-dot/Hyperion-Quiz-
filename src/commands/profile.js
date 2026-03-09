const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ContainerBuilder, SectionBuilder, TextDisplayBuilder, SeparatorBuilder } = require('../utils/uiBuilders');
const User = require('../database/User');
const { getEmoji } = require('../utils/emojiManager');

const PRIMARY_GUILD_ID = '1422969507734884374';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription("Access the Hyperion player profile records.")
        .addUserOption(opt => opt.setName('user').setDescription('Sector authorization: Target player').setRequired(false)),
    async execute(interaction) {
        if (interaction.guildId !== PRIMARY_GUILD_ID) {
            return interaction.reply({ content: "This bot only works inside the Hyperion server.", ephemeral: true });
        }

        const target = interaction.options.getUser('user') || interaction.user;
        const dbUser = await User.getOrCreate(target.id, target.username, target.displayAvatarURL());
        
        if (!dbUser) {
            return interaction.reply({ content: "❌ Error: Player not found in Hyperion Database.", ephemeral: true });
        }

        const rank = (await User.countDocuments({ total_points: { $gt: dbUser.total_points } })) + 1;
        const accuracy = dbUser.games_played > 0 
            ? ((dbUser.correct_answers / (dbUser.games_played * 5)) * 100).toFixed(1) 
            : 0;

        const container = new ContainerBuilder()
            .setAccentColor(0x6c63ff)
            .setThumbnail(target.displayAvatarURL())
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`👤 **HYPERION PLAYER ID: ${target.username.toUpperCase()}**\n` + "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯" + `\nStatus: **Authenticated**\nRank: **#${rank}** Global`)
            ))
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `📊 **CAPITAL & EXPERIENCE**\n` +
                    `${getEmoji('COIN')} **Capital:** ${(dbUser.coins || 0).toLocaleString()} ${getEmoji('COIN')}\n` +
                    `${getEmoji('LEVEL')} **Level:** ${dbUser.level || 1}\n` +
                    `🔥 **Total Points:** ${(dbUser.total_points || 0).toLocaleString()} PTS`
                )
            ))
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `📈 **TOURNAMENT DATA**\n` +
                    `${getEmoji('TROPHY')} **Victories:** ${dbUser.quiz_wins || 0}\n` +
                    `🎯 **Efficiency:** ${accuracy}%\n` +
                    `🎮 **Engagements:** ${dbUser.games_played || 0}`
                )
            ))
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`\n🌐 **LIVE ANALYTICS:**\n[View Web Dashboard](${process.env.WEBSITE_URL || 'http://localhost:3000'}/player/${target.id})`)
            ));

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_view_leaderboard').setLabel('GLOBAL RANKINGS').setEmoji('🏆').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('btn_play_quiz').setLabel('START ENGAGEMENT').setEmoji('⚡').setStyle(ButtonStyle.Success)
        );
        container.addActionRowComponents(row);

        await interaction.reply(container.toJSON());
    }
};
