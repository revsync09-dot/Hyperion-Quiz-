const { SlashCommandBuilder } = require('discord.js');
const { ContainerBuilder, SectionBuilder, TextDisplayBuilder, SeparatorBuilder, buildError } = require('../utils/uiBuilders');
const User = require('../database/User');
const { getEmoji } = require('../utils/emojiManager');

const PRIMARY_GUILD_ID = '1422969507734884374';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Access your Hyperion server capital records.'),
    async execute(interaction) {
        if (interaction.guildId !== PRIMARY_GUILD_ID) {
            return interaction.reply({ ...buildError("This bot only works inside the Hyperion server.").toJSON(), flags: 64 });
        }

        await interaction.deferReply({ flags: 64 });

        const target = interaction.options.getUser('user') || interaction.user;
        let user = await User.getOrCreate(target.id, target.username, target.displayAvatarURL());
        
        if (!user) {
            return interaction.editReply({ ...buildError("Player not identified in Hyperion database.").toJSON() });
        }

        const coinEmoji = getEmoji('COIN');
        const container = new ContainerBuilder()
            .setAccentColor(0xF1C40F)
            .setThumbnail(target.displayAvatarURL())
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`💰 **HYPERION CAPITAL DASHBOARD**\n` + "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯" + `\nAuthentication: **Confirmed**\nAccount Holder: **${target.username.toUpperCase()}**\n\nBalance: **${(user.coins || 0).toLocaleString()}** ${coinEmoji}`)
            ))
            .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`\n*Visit the Web Terminal for detailed transaction logs.*`)
            ));

        await interaction.editReply(container.toJSON());
    }
};
