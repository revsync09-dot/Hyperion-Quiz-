const { SlashCommandBuilder } = require('discord.js');
const { ContainerBuilder, SectionBuilder, TextDisplayBuilder, SeparatorBuilder } = require('../utils/uiBuilders');
const User = require('../database/User');
const { getEmoji } = require('../utils/emojiManager');

const PRIMARY_GUILD_ID = '1422969507734884374';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Access your Hyperion server capital records.'),
    async execute(interaction) {
        if (interaction.guildId !== PRIMARY_GUILD_ID) {
            return interaction.reply({ content: "This bot only works inside the Hyperion server.", ephemeral: true });
        }

        let dbUser = await User.getOrCreate(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
        
        if (!dbUser) {
            return interaction.reply({ content: "❌ Error: Player not identified in database.", ephemeral: true });
        }

        const coinEmoji = getEmoji('COIN');
        const container = new ContainerBuilder()
            .setAccentColor(0xF1C40F)
            .setThumbnail(interaction.user.displayAvatarURL())
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`💰 **HYPERION CAPITAL DASHBOARD**\n` + "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯" + `\nAuthentication: **Confirmed**\nAccount Holder: **${interaction.user.username.toUpperCase()}**\n\nBalance: **${(dbUser.coins || 0).toLocaleString()}** ${coinEmoji}`)
            ))
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`\n*Visit the Web Terminal for detailed transaction logs.*`)
            ));

        await interaction.reply(container.toJSON());
    }
};
