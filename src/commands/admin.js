const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ContainerBuilder, SectionBuilder, TextDisplayBuilder, buildError } = require('../utils/uiBuilders');
const supabase = require('../database/supabase');

const PRIMARY_GUILD_ID = '1422969507734884374';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Hyperion Core: Oversight & Logging Protocols')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => 
            sub.setName('update')
               .setDescription('Broadcast a system update to the Website Quiz Meister')
               .addStringOption(opt => opt.setName('version').setDescription('Target Version (e.g. v2.6.0)').setRequired(true))
               .addStringOption(opt => opt.setName('title').setDescription('Protocol Title').setRequired(true))
               .addStringOption(opt => opt.setName('category').setDescription('Update Sector').setRequired(true)
                   .addChoices(
                       { name: 'Bot Core', value: 'BOT' },
                       { name: 'Website Quiz Meister', value: 'WEBSITE' },
                       { name: 'General Protocol', value: 'GENERAL' }
                   ))
               .addStringOption(opt => opt.setName('content').setDescription('Detailed log data').setRequired(true))
               .addBooleanOption(opt => opt.setName('major').setDescription('Critical system shift?').setRequired(false))
        ),
    async execute(interaction) {
        if (interaction.guildId !== PRIMARY_GUILD_ID) {
            return interaction.reply({ ...buildError("Access denied. Target guild mismatch.").toJSON(), ephemeral: true });
        }

        if (interaction.options.getSubcommand() === 'update') {
            const version = interaction.options.getString('version');
            const title = interaction.options.getString('title');
            const category = interaction.options.getString('category');
            const content = interaction.options.getString('content');
            const is_major = interaction.options.getBoolean('major') || false;

            try {
                const { error } = await supabase.from('system_updates').insert({
                    version,
                    title,
                    category,
                    content,
                    is_major
                });

                if (error) throw error;

                const container = new ContainerBuilder()
                    .setAccentColor(0x22c55e)
                    .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`✅ **PROTOCOL BROADCAST SUCCESSFUL**\n` + "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯" + `\nSector: **${category}**\nVersion: **${version}**\nTitle: **${title}**\n\nThe Quiz Meister has been updated with this system log.`)
                    ));

                await interaction.reply({ ...container.toJSON(), ephemeral: true });
            } catch (err) {
                console.error('[ADMIN] Update broadcast failed:', err);
                await interaction.reply({ ...buildError("Protocol Failure: Could not push log to database.").toJSON(), ephemeral: true });
            }
        }
    }
};
