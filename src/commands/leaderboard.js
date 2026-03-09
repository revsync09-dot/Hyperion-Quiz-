const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { ContainerBuilder, SectionBuilder, TextDisplayBuilder, SeparatorBuilder, buildError } = require('../utils/uiBuilders');
const User = require('../database/User');
const { getEmoji } = require('../utils/emojiManager');

const PRIMARY_GUILD_ID = '1422969507734884374';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the Hyperion server leaderboard.')
        .addStringOption(opt => opt.setName('category').setDescription('Leaderboard category')
            .addChoices(
                { name: 'Total Points', value: 'total_points' },
                { name: 'Coins', value: 'coins' },
                { name: 'Level', value: 'level' },
                { name: 'Quiz Wins', value: 'quiz_wins' })
            .setRequired(false)),
    async execute(interaction) {
        if (interaction.guildId !== PRIMARY_GUILD_ID) {
            return interaction.reply({ ...buildError("This bot only works inside the Quiz Meister server.").toJSON(), flags: 64 });
        }

        const container = new ContainerBuilder()
            .setAccentColor(0x6c63ff)
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`🏆 **GLOBAL RANKINGS MOVED**\n` + "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯" + `\nThe official Quiz Meister Leaderboard is now hosted on our dedicated web terminal for real-time tracking.\n\n🌐 **[Access Leaderboard Here](${process.env.WEBSITE_URL || 'https://hyperion-quiz.vercel.app'}/leaderboard)**`)
            ));

        const row = new ActionRowBuilder().addComponents(
             new ButtonBuilder()
                .setLabel('Go to Website')
                .setStyle(ButtonStyle.Link)
                .setURL(`${process.env.WEBSITE_URL || 'https://hyperion-quiz.vercel.app'}/leaderboard`)
        );
        container.addActionRowComponents(row);

        await interaction.reply({ ...container.toJSON(), flags: 64 });
    }
};
