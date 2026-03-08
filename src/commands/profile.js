const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ContainerBuilder, SectionBuilder, TextDisplayBuilder, SeparatorBuilder } = require('../utils/uiBuilders');
const User = require('../database/User');
const { getEmoji } = require('../utils/emojiManager');

const PRIMARY_GUILD_ID = '1422969507734884374';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription("Shows your profile or another user's profile.")
        .addUserOption(opt => opt.setName('user').setDescription('Select a player').setRequired(false)),
    async execute(interaction) {
        if (interaction.guildId !== PRIMARY_GUILD_ID) {
            return interaction.reply({ content: "This bot only works inside the Hyperion server.", ephemeral: true });
        }

        const target = interaction.isChatInputCommand() ? (interaction.options.getUser('user') || interaction.user) : interaction.user;
        const dbUser = await User.getOrCreate(target.id, target.username, target.displayAvatarURL());
        
        if (!dbUser) {
            return interaction.reply({ content: "❌ Error: Player not found in database.", ephemeral: true });
        }

        const rank = (await User.countDocuments({ total_points: { $gt: dbUser.total_points } })) + 1;
        const accuracy = dbUser.games_played > 0 
            ? ((dbUser.correct_answers / (dbUser.games_played * 5)) * 100).toFixed(1) 
            : 0;

        const container = new ContainerBuilder().setAccentColor(0x6c63ff)
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${target.username}'s Profile** — Hyperion Server`)))
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(true))
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `👤 **Player Stat Summary**\n` +
                    `▫️ ${getEmoji('COIN')} **Coins:** ${dbUser.coins}\n` +
                    `▫️ ${getEmoji('LEVEL')} **Level:** ${dbUser.level}\n` +
                    `▫️ ${getEmoji('TROPHY')} **Quiz Wins:** ${dbUser.quiz_wins}\n` +
                    `▫️ 🔥 **Total Points:** ${dbUser.total_points}\n` +
                    `▫️ 👑 **Rank:** #${rank}`)))
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(true))
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `📊 **Detailed Performance**\n` +
                    `▫️ 🎯 **Accuracy:** ${accuracy}%\n` +
                    `▫️ 🎮 **Games Played:** ${dbUser.games_played}\n` +
                    `▫️ ✅ **Correct Answers:** ${dbUser.correct_answers}`)))
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(true))
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`🌐 **Web Dashboard:**\nView your detailed activity charts on our website: [Click Here](${process.env.WEBSITE_URL || 'http://localhost:3000'}/player/${target.id})`)));

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_view_leaderboard').setLabel('Leaderboard').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('btn_play_quiz').setLabel('Play Again').setStyle(ButtonStyle.Success)
        );
        container.addActionRowComponents(row);

        await interaction.reply(container.toJSON());
    }
};
