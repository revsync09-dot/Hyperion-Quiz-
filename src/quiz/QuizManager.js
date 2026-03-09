const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    buildError,
    buildSuccess
} = require('../utils/uiBuilders');
const { getEmoji, getComponentEmoji } = require('../utils/emojiManager');
const User = require('../database/User');
const supabase = require('../database/supabase');

const PRIMARY_GUILD_ID = '1422969507734884374';

const CATEGORIES = [
    { name: 'Gaming', id: 15 },
    { name: 'Anime', id: 31 },
    { name: 'General Knowledge', id: 9 },
    { name: 'Movies', id: 11 },
    { name: 'Music', id: 12 }
];

const ROUNDS = [
    { level: 'Easy', points: 10, apiDiff: 'easy' },
    { level: 'Medium', points: 20, apiDiff: 'medium' },
    { level: 'Hard', points: 35, apiDiff: 'hard' },
    { level: 'Very Hard', points: 50, apiDiff: 'hard' },
    { level: 'Extreme', points: 100, apiDiff: 'hard' }
];

const activeGames = new Map();

async function fetchQuestion(categoryId, difficulty) {
    try {
        const response = await fetch(
            `https://opentdb.com/api.php?amount=1&category=${categoryId}&difficulty=${difficulty}&type=multiple`
        );
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return null;
        }

        const decode = (value) =>
            value
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'")
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');

        const result = data.results[0];
        const question = decode(result.question);
        const correctAnswer = decode(result.correct_answer);
        const incorrectAnswers = result.incorrect_answers.map(decode);
        const choices = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);
        const correctIndex = choices.indexOf(correctAnswer);

        return { question, choices, correctIndex };
    } catch (error) {
        console.error('[QUIZ] Fetch error:', error);
        return null;
    }
}

async function startLobby(interaction) {
    if (interaction.guildId !== PRIMARY_GUILD_ID) {
        return interaction.reply({ ...buildError('This bot only works inside the Hyperion server.').toJSON(), flags: 64 });
    }

    if (activeGames.has(interaction.channelId)) {
        if (interaction.isAutoDeploy) return;
        return interaction.reply({ ...buildError('A quiz is already active in this channel!').toJSON(), flags: 64 });
    }

    const game = {
        channelId: interaction.channelId,
        players: new Map(),
        round: 0,
        gameState: 'lobby'
    };

    activeGames.set(interaction.channelId, game);

    const lobbyText =
        `${getEmoji('QUIZ')} **HYPERION ENGAGEMENT PROTOCOL**\n` +
        `Recruitment Phase active. Click **Join** to authenticate.\n\n` +
        `-------------------------\n` +
        `Starting in 15 seconds...`;

    const container = new ContainerBuilder()
        .setAccentColor(0x6c63ff)
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(lobbyText))
        );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('quiz_join')
            .setLabel('Join Session')
            .setEmoji(getComponentEmoji('ROCKET'))
            .setStyle(ButtonStyle.Primary)
    );
    container.addActionRowComponents(row);

    const message = await interaction.reply({ ...container.toJSON(), fetchReply: true });
    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

    collector.on('collect', async (buttonInteraction) => {
        if (buttonInteraction.customId !== 'quiz_join') return;

        if (game.players.has(buttonInteraction.user.id)) {
            return buttonInteraction.reply({
                ...buildError('Authentication already confirmed.').toJSON(),
                flags: 64
            });
        }

        game.players.set(buttonInteraction.user.id, {
            points: 0,
            correct_answers: 0,
            username: buttonInteraction.user.username,
            avatar: buttonInteraction.user.displayAvatarURL()
        });

        await buttonInteraction.reply({
            ...buildSuccess('Join Confirmed', `Session joined. Stand by for round start. ${getEmoji('ROCKET')}`).toJSON(),
            flags: 64
        });
    });

    collector.on('end', async () => {
        if (game.players.size === 0) {
            activeGames.delete(interaction.channelId);
            return interaction.followUp(buildError('No participants identified. Protocol aborted.').toJSON()).catch(console.error);
        }

        try {
            await startNextRound(interaction, game);
        } catch (error) {
            console.error('[QUIZ] Critical error starting next round:', error);
            activeGames.delete(interaction.channelId);
        }
    });
}

async function startNextRound(interaction, game) {
    game.round += 1;

    if (game.round > ROUNDS.length) {
        return endQuiz(interaction, game);
    }

    const roundInfo = ROUNDS[game.round - 1];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const questionData = await fetchQuestion(category.id, roundInfo.apiDiff);

    if (!questionData) {
        activeGames.delete(game.channelId);
        return interaction.followUp(buildError('Data stream interrupted. Session terminated.').toJSON());
    }

    const buttonEmojis = [
        getComponentEmoji('ONE'),
        getComponentEmoji('TWO'),
        getComponentEmoji('THREE'),
        getComponentEmoji('FOUR')
    ];
    const textEmojis = [
        getEmoji('ONE'),
        getEmoji('TWO'),
        getEmoji('THREE'),
        getEmoji('FOUR')
    ];

    const headerText =
        `${getEmoji('CHART')} **HYPERION ROUND ${game.round} / 5**\n` +
        `-------------------------\n` +
        `Complexity: **${roundInfo.level}**\n` +
        `Value: **${roundInfo.points}** ${getEmoji('COIN')}\n` +
        `Sector: **${category.name}**`;

    const choicesText = questionData.choices
        .map((choice, index) => `${textEmojis[index]} ${choice}`)
        .join('\n');

    const questionText = `**QUESTION**\n${questionData.question}\n\n${choicesText}`;

    const container = new ContainerBuilder()
        .setAccentColor(0x9d4edd)
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(headerText))
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(questionText))
        );

    const row = new ActionRowBuilder();
    questionData.choices.forEach((_, index) => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`quiz_ans_${index}`)
                .setLabel(`${index + 1}`)
                .setEmoji(buttonEmojis[index])
                .setStyle(ButtonStyle.Secondary)
        );
    });
    container.addActionRowComponents(row);

    const message = await interaction.channel.send(container.toJSON());
    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });
    const answered = new Set();

    collector.on('collect', async (buttonInteraction) => {
        if (!game.players.has(buttonInteraction.user.id)) {
            return buttonInteraction.reply({
                ...buildError('You are not authorized for this session.').toJSON(),
                flags: 64
            });
        }

        if (answered.has(buttonInteraction.user.id)) {
            return buttonInteraction.reply({
                ...buildError('Response already recorded.').toJSON(),
                flags: 64
            });
        }

        answered.add(buttonInteraction.user.id);
        const choiceIndex = parseInt(buttonInteraction.customId.split('_')[2], 10);
        const playerData = game.players.get(buttonInteraction.user.id);

        if (choiceIndex === questionData.correctIndex) {
            playerData.points += roundInfo.points;
            playerData.correct_answers += 1;

            await buttonInteraction.reply({
                ...buildSuccess('Outcome accepted', `Positive. Outcome accepted (+${roundInfo.points} Pts)`).toJSON(),
                flags: 64
            });
            return;
        }

        await buttonInteraction.reply({
            ...buildError(`Negative. Verified answer: **${questionData.choices[questionData.correctIndex]}**`).toJSON(),
            flags: 64
        });
    });

    collector.on('end', async () => {
        try {
            await startNextRound(interaction, game);
        } catch (error) {
            console.error('[QUIZ] Critical error continuing round loop:', error);
            activeGames.delete(game.channelId);
        }
    });
}

async function endQuiz(interaction, game) {
    activeGames.delete(game.channelId);

    const players = Array.from(game.players.entries()).map(([discord_id, data]) => ({ discord_id, ...data }));
    players.sort((left, right) => right.points - left.points);

    const { data: gameRecord } = await supabase
        .from('quiz_games')
        .insert({
            guild_id: PRIMARY_GUILD_ID,
            ended_at: new Date(),
            difficulty_rounds: 5
        })
        .select()
        .single();

    for (let index = 0; index < players.length; index += 1) {
        const player = players[index];
        const dbUser = await User.getOrCreate(player.discord_id, player.username, player.avatar);

        if (!dbUser) continue;

        const reward = Math.floor(player.points * 0.5);
        const updates = {
            quiz_wins: (dbUser.quiz_wins || 0) + (index === 0 && player.points > 0 ? 1 : 0),
            total_points: (dbUser.total_points || 0) + player.points,
            correct_answers: (dbUser.correct_answers || 0) + player.correct_answers,
            games_played: (dbUser.games_played || 0) + 1
        };

        await User.save(player.discord_id, updates);

        if (!gameRecord) continue;

        await supabase.from('quiz_results').insert({
            quiz_id: gameRecord.id,
            user_id: dbUser.id,
            score: player.points,
            position: index + 1
        });

        if (player.points > 0) {
            await User.updateCoins(player.discord_id, reward, 'quiz_reward');
        }
    }

    const medals = { 1: getEmoji('FIRST'), 2: getEmoji('SECOND'), 3: getEmoji('THIRD') };
    const resultText = players
        .map((player, index) => {
            const rank = index + 1;
            const reward = Math.floor(player.points * 0.5);
            return `${medals[rank] || `${rank}.`} **<@${player.discord_id}>** - ${player.points} Pts (+${reward} ${getEmoji('COIN')})`;
        })
        .join('\n');

    const summaryText = `${getEmoji('TROPHY')} **HYPERION TOURNAMENT FINALIZED**\n-------------------------`;

    const container = new ContainerBuilder()
        .setAccentColor(0x6c63ff)
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(summaryText))
        )
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(resultText || 'Insufficient engagement.')
            )
        );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('btn_play_again')
            .setLabel('Re-Engage')
            .setEmoji(getComponentEmoji('REFRESH'))
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('btn_view_leaderboard')
            .setLabel('Global Ranks')
            .setEmoji(getComponentEmoji('TROPHY'))
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('btn_view_profile')
            .setLabel('Access Profile')
            .setEmoji(getComponentEmoji('PROFILE'))
            .setStyle(ButtonStyle.Secondary)
    );
    container.addActionRowComponents(row);

    await interaction.channel.send(container.toJSON());
}

module.exports = {
    startLobby,
    getActiveGamesCount: () => activeGames.size
};
