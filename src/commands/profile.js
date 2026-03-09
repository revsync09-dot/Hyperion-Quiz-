const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ContainerBuilder, SectionBuilder, TextDisplayBuilder, SeparatorBuilder, buildError } = require('../utils/uiBuilders');
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
            return interaction.reply({ ...buildError("This bot only works inside the Quiz Meister server.").toJSON(), flags: 64 });
        }

        const target = interaction.options.getUser('user') || interaction.user;

        const container = new ContainerBuilder()
            .setAccentColor(0x6c63ff)
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`👤 **PLAYER PROFILES MOVED**\n` + "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯" + `\nDetailed player analytics for **${target.username}** are now hosted on our dedicated web terminal.\n\n🌐 **[Access Player Profile Here](${process.env.WEBSITE_URL || 'https://hyperion-quiz.vercel.app'}/player/${target.id})**`)
            ));

        const row = new ActionRowBuilder().addComponents(
             new ButtonBuilder()
                .setLabel('View Web Profile')
                .setStyle(ButtonStyle.Link)
                .setURL(`${process.env.WEBSITE_URL || 'https://hyperion-quiz.vercel.app'}/player/${target.id}`)
        );
        container.addActionRowComponents(row);

        await interaction.reply({ ...container.toJSON(), flags: 64 });
    }
};
