const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { buildPanel, buildError } = require('../utils/uiBuilders');
const { getEmoji } = require('../utils/emojiManager');
const { createSystemUpdate } = require('../utils/systemUpdates');
const supabase = require('../database/supabase');

const PRIMARY_GUILD_ID = '1422969507734884374';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Hyperion Core: Oversight & Logging Protocols')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((sub) =>
            sub
                .setName('update')
                .setDescription('Broadcast a system update to the Website Quiz Meister')
                .addStringOption((opt) => opt.setName('version').setDescription('Target Version (e.g. v2.6.0)').setRequired(true))
                .addStringOption((opt) => opt.setName('title').setDescription('Protocol Title').setRequired(true))
                .addStringOption((opt) =>
                    opt
                        .setName('category')
                        .setDescription('Update Sector')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Bot Core', value: 'BOT' },
                            { name: 'Website Quiz Meister', value: 'WEBSITE' },
                            { name: 'General Protocol', value: 'GENERAL' }
                        )
                )
                .addStringOption((opt) => opt.setName('content').setDescription('Detailed log data').setRequired(true))
                .addBooleanOption((opt) => opt.setName('major').setDescription('Critical system shift?').setRequired(false))
        )
        .addSubcommand((sub) =>
            sub
                .setName('autoquiz')
                .setDescription('Configure Automated Quiz Deployment (AQD)')
                .addChannelOption((opt) => opt.setName('channel').setDescription('Target Channel for auto quizzes').setRequired(true))
                .addIntegerOption((opt) => opt.setName('interval').setDescription('Interval in minutes').setRequired(true))
                .addBooleanOption((opt) => opt.setName('enabled').setDescription('Enable or disable auto quizzes').setRequired(true))
        ),

    async execute(interaction) {
        if (interaction.guildId !== PRIMARY_GUILD_ID) {
            return interaction.reply({ ...buildError('Access denied. Target guild mismatch.').toJSON(), flags: 64 });
        }

        if (interaction.options.getSubcommand() === 'update') {
            const version = interaction.options.getString('version');
            const title = interaction.options.getString('title');
            const category = interaction.options.getString('category');
            const content = interaction.options.getString('content');
            const isMajor = interaction.options.getBoolean('major') || false;

            try {
                const result = await createSystemUpdate({
                    version,
                    title,
                    category,
                    content,
                    is_major: isMajor
                });

                const panel = buildPanel({
                    icon: getEmoji('SUCCESS'),
                    title: result.created ? 'PROTOCOL BROADCAST SUCCESSFUL' : 'DUPLICATE UPDATE BLOCKED',
                    accentColor: 0x22c55e,
                    lines: [
                        `Sector: **${category}**`,
                        `Version: **${version}**`,
                        `Title: **${title}**`,
                        '',
                        result.created
                            ? 'The Quiz Meister has been updated with this system log.'
                            : 'An identical recent update already exists, so no second website entry was created.'
                    ]
                });

                await interaction.reply({ ...panel.toJSON(), flags: 64 });
            } catch (error) {
                console.error('[ADMIN] Update broadcast failed:', error);
                await interaction.reply({
                    ...buildError('Protocol Failure: Could not push log to database.').toJSON(),
                    flags: 64
                });
            }
            return;
        }

        if (interaction.options.getSubcommand() === 'autoquiz') {
            const channel = interaction.options.getChannel('channel');
            const interval = interaction.options.getInteger('interval');
            const enabled = interaction.options.getBoolean('enabled');

            try {
                const { error } = await supabase.from('guild_config').upsert({
                    guild_id: interaction.guildId,
                    quiz_channel_id: channel.id,
                    quiz_interval_minutes: interval,
                    is_auto_quiz_enabled: enabled,
                    updated_at: new Date()
                });

                if (error) throw error;

                const panel = buildPanel({
                    icon: getEmoji('SUCCESS'),
                    title: 'AUTOMATED QUIZ DEPLOYMENT CONFIGURED',
                    accentColor: 0x6c63ff,
                    lines: [
                        `Target Channel: <#${channel.id}>`,
                        `Interval: **${interval} minute${interval === 1 ? '' : 's'}**`,
                        `Status: **${enabled ? 'ACTIVE' : 'DISABLED'}**`
                    ]
                });

                await interaction.reply({ ...panel.toJSON(), flags: 64 });
            } catch (error) {
                console.error('[ADMIN] Autoquiz config failed:', error);
                await interaction.reply({
                    ...buildError('Protocol Failure: Could not update configuration.').toJSON(),
                    flags: 64
                });
            }
        }
    }
};
