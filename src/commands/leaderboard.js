const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { ContainerBuilder, SectionBuilder, TextDisplayBuilder, SeparatorBuilder } = require('../utils/uiBuilders');
const User = require('../database/User');
const { getEmoji } = require('../utils/emojiManager');

const PRIMARY_GUILD_ID = '1422969507734884374';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the Hyperion leaderboard.')
        .addStringOption(opt => opt.setName('category').setDescription('Leaderboard category')
            .addChoices(
                { name: 'Total Points', value: 'total_points' },
                { name: 'Coins', value: 'coins' },
                { name: 'Level', value: 'level' },
                { name: 'Quiz Wins', value: 'quiz_wins' })
            .setRequired(false)),
    async execute(interaction) {
        if (interaction.guildId !== PRIMARY_GUILD_ID) {
            return interaction.reply({ content: "This bot only works inside the Hyperion server.", ephemeral: true });
        }

        const category = interaction.options.getString('category') || 'total_points';
        await renderLeaderboard(interaction, category, 1);
    }
};

async function renderLeaderboard(interaction, category, page, isUpdate = false) {
    const limit = 5, skip = (page - 1) * limit;
    const sortOpt = {}; sortOpt[category] = -1;
    
    // We already filter in User.find technically if we only have one guild, 
    // but the schema should ideally have it. 
    // For now we get all players and sort.
    const users = await User.find({}, sortOpt, skip, limit);
    const total = await User.countDocuments();
    const totalPages = Math.ceil(total / limit) || 1;
    
    const emojiMap = { 1: '🥇', 2: '🥈', 3: '🥉' };
    const titles = { 
        total_points: `🔥 Points Leaderboard`, 
        coins: `${getEmoji('COIN')} Coins Leaderboard`, 
        level: `${getEmoji('LEVEL')} Level Leaderboard`, 
        quiz_wins: `${getEmoji('QUIZ')} Quiz Wins` 
    };

    let text = users.length === 0 ? '*No players found in this category yet.*' : '';
    users.forEach((u, i) => {
        const rank = skip + i + 1;
        const rd = emojiMap[rank] || `${rank})`;
        let val = (u[category] || 0).toLocaleString();
        
        if (category === 'coins') val += ` 🪙`;
        else if (category === 'level') val = 'Lv ' + val;
        else if (category === 'total_points') val += ' Pts';
        else val += ' Wins';
        
        text += `${rd} **${u.username || u.discord_id}** — ${val}\n`;
    });

    const container = new ContainerBuilder().setAccentColor(0x6c63ff)
        .addSectionComponents(new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${titles[category]}**\nPage ${page} / ${totalPages}`)))
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(true))
        .addSectionComponents(new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(text || 'Empty.')));

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`lb_prev_${category}_${page}`).setLabel('◀').setStyle(ButtonStyle.Primary).setDisabled(page <= 1),
        new ButtonBuilder().setCustomId(`lb_next_${category}_${page}`).setLabel('▶').setStyle(ButtonStyle.Primary).setDisabled(page >= totalPages),
        new ButtonBuilder().setCustomId('btn_view_profile').setLabel('My Profile').setStyle(ButtonStyle.Secondary)
    );
    container.addActionRowComponents(row);

    if (isUpdate) {
        await interaction.update(container.toJSON());
    } else {
        await interaction.reply(container.toJSON());
    }
}

module.exports.renderLeaderboard = renderLeaderboard;
