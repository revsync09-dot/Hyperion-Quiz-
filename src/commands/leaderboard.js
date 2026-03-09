const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { ContainerBuilder, SectionBuilder, TextDisplayBuilder, SeparatorBuilder } = require('../utils/uiBuilders');
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
            return interaction.reply({ content: "This bot only works inside the Hyperion server.", ephemeral: true });
        }

        const category = interaction.options.getString('category') || 'total_points';
        await renderLeaderboard(interaction, category, 1);
    }
};

async function renderLeaderboard(interaction, category, page, isUpdate = false) {
    const limit = 5;
    const skip = (page - 1) * limit;
    
    const sortParams = {};
    sortParams[category] = -1; // Sort descending
    
    const users = await User.find({}, sortParams, skip, limit);
    const totalCount = await User.countDocuments();
    const totalPages = Math.ceil(totalCount / limit) || 1;
    
    const medals = { 1: getEmoji('FIRST'), 2: getEmoji('SECOND'), 3: getEmoji('THIRD') };
    const categoryTitles = { 
        total_points: `🔥 POINTS TOURNAMENT`, 
        coins: `${getEmoji('COIN')} CAPITAL RANKINGS`, 
        level: `${getEmoji('LEVEL')} EXPERIENCE TIERS`, 
        quiz_wins: `${getEmoji('QUIZ')} VICTORIES` 
    };

    let leaderText = '';
    if (users.length === 0) {
        leaderText = `*No records identified in Sector: ${category.toUpperCase()}*`;
    } else {
        users.forEach((u, i) => {
            const rank = skip + i + 1;
            const medal = medals[rank] || `▫️ ${rank}.`;
            let displayVal = (u[category] || 0).toLocaleString();
            
            if (category === 'coins') displayVal += ` ${getEmoji('COIN')}`;
            else if (category === 'level') displayVal = `LV ${displayVal}`;
            else if (category === 'total_points') displayVal += ' PTS';
            else displayVal += ' WINS';
            
            leaderText += `${medal} **${u.username || u.discord_id}**\nValue: **${displayVal}**\n\n`;
        });
    }

    const container = new ContainerBuilder()
        .setAccentColor(0x6c63ff)
        .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`🏆 **HYPERION GLOBAL LEADERBOARD**\n` + "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯" + `\nSector: **${categoryTitles[category]}**`)
        ))
        .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(leaderText)
        ))
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addSectionComponents(new SectionBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`Page **${page}** of **${totalPages}** — *Aggregating Guild Data*`)
        ));

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`lb_prev_${category}_${page}`).setLabel('PREV').setEmoji('⬅️').setStyle(ButtonStyle.Primary).setDisabled(page <= 1),
        new ButtonBuilder().setCustomId(`lb_next_${category}_${page}`).setLabel('NEXT').setEmoji('➡️').setStyle(ButtonStyle.Primary).setDisabled(page >= totalPages),
        new ButtonBuilder().setCustomId('btn_view_profile').setLabel('MY PROFILE').setEmoji('👤').setStyle(ButtonStyle.Secondary)
    );
    container.addActionRowComponents(row);

    const payload = container.toJSON();
    if (isUpdate) {
        await interaction.update(payload);
    } else {
        await interaction.reply(payload);
    }
}

module.exports.renderLeaderboard = renderLeaderboard;
