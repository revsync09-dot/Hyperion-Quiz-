const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { ContainerBuilder, SectionBuilder, TextDisplayBuilder, SeparatorBuilder, buildError, buildSuccess, buildInfo } = require('../utils/uiBuilders');
const { getEmoji } = require('../utils/emojiManager');
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

async function fetchQuestion(catId, difficulty) {
  try {
    const res = await fetch(`https://opentdb.com/api.php?amount=1&category=${catId}&difficulty=${difficulty}&type=multiple`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const q = data.results[0];
      const decode = (str) => str.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      
      const question = decode(q.question);
      const correctAnswer = decode(q.correct_answer);
      const incorrectAnswers = q.incorrect_answers.map(decode);
      
      const choices = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);
      const correctIndex = choices.indexOf(correctAnswer);
      
      return { question, choices, correctIndex };
    }
    return null;
  } catch (err) {
    console.error('Fetch error:', err);
    return null;
  }
}

async function startLobby(interaction) {
    if (interaction.guildId !== PRIMARY_GUILD_ID) {
        return interaction.reply({ ...buildError("This bot only works inside the Hyperion server.").toJSON(), flags: 64 });
    }

    if (activeGames.has(interaction.channelId)) {
        return interaction.reply({ ...buildError("A quiz is already active in this channel!").toJSON(), flags: 64 });
    }

    const game = {
        channelId: interaction.channelId,
        players: new Map(),
        round: 0,
        gameState: 'lobby'
    };

    activeGames.set(interaction.channelId, game);

    const container = new ContainerBuilder()
        .setAccentColor(0x6c63ff)
        .addSectionComponents(
            new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${getEmoji('QUIZ')} **HYPERION ENGAGEMENT PROTOCOL**\nRecruitment Phase active. Click **Join** to authenticate.\n\n` + "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯" + `\nStarting in 15 seconds...`))
        );
        
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('quiz_join').setLabel('Join Session').setEmoji('🚀').setStyle(ButtonStyle.Primary)
    );
    container.addActionRowComponents(row);

    const message = await interaction.reply({ ...container.toJSON(), withResponse: true });

    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

    collector.on('collect', async i => {
        if (i.customId === 'quiz_join') {
            if (game.players.has(i.user.id)) {
                return i.reply({ ...buildError("Authentication already confirmed.").toJSON(), flags: 64 });
            }
            game.players.set(i.user.id, { points: 0, correct_answers: 0, username: i.user.username, avatar: i.user.displayAvatarURL() });
            await i.reply({ ...buildSuccess("Join Confirmed", "Session joined. Stand by for round start. 🚀").toJSON(), flags: 64 });
        }
    });

    collector.on('end', async () => {
        if (game.players.size === 0) {
            activeGames.delete(interaction.channelId);
            return interaction.followUp(buildError("No participants identified. Protocol aborted.").toJSON()).catch(e => console.error(e));
        }
        try {
            await startNextRound(interaction, game);
        } catch (e) {
            console.error('[QUIZ] critical error starting next round', e);
            activeGames.delete(interaction.channelId);
        }
    });
}

async function startNextRound(interaction, game) {
    game.round++;
    if (game.round > 5) {
        return endQuiz(interaction, game);
    }

    const roundInfo = ROUNDS[game.round - 1];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const qData = await fetchQuestion(category.id, roundInfo.apiDiff);

    if (!qData) {
        activeGames.delete(game.channelId);
        return interaction.followUp(buildError("Data stream interrupted. Session terminated.").toJSON());
    }

    const btnEmojis = [getEmoji('ONE'), getEmoji('TWO'), getEmoji('THREE'), getEmoji('FOUR')];
    const choicesList = qData.choices.map((c, i) => `${btnEmojis[i]} **${c}**`).join('\n');

    const container = new ContainerBuilder()
        .setAccentColor(0x9d4edd)
        .addSectionComponents(
            new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`📊 **HYPERION ROUND ${game.round} / 5**\n` + "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯" + `\nComplexity: **${roundInfo.level}**\nValue: **${roundInfo.points}** ${getEmoji('COIN')}\nSector: **${category.name}**`))
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addSectionComponents(
            new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**QUESTION:**\n${qData.question}\n\n${choicesList}`))
        );

    const row = new ActionRowBuilder();
    qData.choices.forEach((choice, idx) => {
        row.addComponents(
          new ButtonBuilder()
          .setCustomId(`quiz_ans_${idx}`)
          .setLabel(`${idx + 1}`)
          .setEmoji(btnEmojis[idx])
          .setStyle(ButtonStyle.Secondary)
        );
    });
    container.addActionRowComponents(row);

    const msg = await interaction.channel.send(container.toJSON());
    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

    const answered = new Set();
    collector.on('collect', async i => {
        if (!game.players.has(i.user.id)) {
            return i.reply({ ...buildError("You are not authorized for this session.").toJSON(), flags: 64 });
        }
        if (answered.has(i.user.id)) {
            return i.reply({ ...buildError("Response already recorded.").toJSON(), flags: 64 });
        }

        answered.add(i.user.id);
        const choiceIdx = parseInt(i.customId.split('_')[2]);
        const playerData = game.players.get(i.user.id);

        if (choiceIdx === qData.correctIndex) {
            playerData.points += roundInfo.points;
            playerData.correct_answers++;
            await i.reply({ ...buildSuccess("Outcome accepted", `✅ **Positive.** Outcome accepted (+${roundInfo.points} Pts)`).toJSON(), flags: 64 });
        } else {
            await i.reply({ ...buildError(`❌ **Negative.** Verified answer: **${qData.choices[qData.correctIndex]}**`).toJSON(), flags: 64 });
        }
    });

    collector.on('end', async () => {
        try {
            await startNextRound(interaction, game);
        } catch(e) {
            console.error('[QUIZ] critical error continuing round loops', e);
            activeGames.delete(game.channelId);
        }
    });
}

async function endQuiz(interaction, game) {
    activeGames.delete(game.channelId);

    const playersArr = Array.from(game.players.entries()).map(([discord_id, data]) => ({ discord_id, ...data }));
    playersArr.sort((a, b) => b.points - a.points);

    const { data: gameRecord, error: gameError } = await supabase.from('quiz_games').insert({
        guild_id: PRIMARY_GUILD_ID,
        ended_at: new Date(),
        difficulty_rounds: 5
    }).select().single();

    for (let i = 0; i < playersArr.length; i++) {
        const pd = playersArr[i];
        const dbUser = await User.getOrCreate(pd.discord_id, pd.username, pd.avatar);

        if (dbUser) {
            const updates = {
                quiz_wins: (dbUser.quiz_wins || 0) + (i === 0 && pd.points > 0 ? 1 : 0),
                total_points: (dbUser.total_points || 0) + pd.points,
                correct_answers: (dbUser.correct_answers || 0) + pd.correct_answers,
                games_played: (dbUser.games_played || 0) + 1,
                coins: (dbUser.coins || 0) + Math.floor(pd.points * 0.5)
            };
            
            await User.save(pd.discord_id, updates);

            if (gameRecord) {
              await supabase.from('quiz_results').insert({
                  quiz_id: gameRecord.id,
                  user_id: dbUser.id,
                  score: pd.points,
                  position: i + 1
              });
              if (pd.points > 0) {
                await User.updateCoins(pd.discord_id, Math.floor(pd.points * 0.5), 'quiz_reward');
              }
            }
        }
    }

    let resultText = '';
    const medals = { 1: getEmoji('FIRST'), 2: getEmoji('SECOND'), 3: getEmoji('THIRD') };

    playersArr.forEach((p, idx) => {
        const rank = idx + 1;
        const reward = Math.floor(p.points * 0.5);
        resultText += `${medals[rank] || rank + '.'} **<@${p.discord_id}>** — ${p.points} Pts (+${reward} ${getEmoji('COIN')})\n`;
    });

    const container = new ContainerBuilder()
        .setAccentColor(0x6c63ff)
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`${getEmoji('TROPHY')} **HYPERION TOURNAMENT FINALIZED**\n` + "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯"))
        )
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(resultText || 'Insufficient engagement.'))
        );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('btn_play_again').setLabel('Re-Engage').setEmoji('🔄').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('btn_view_leaderboard').setLabel('Global Ranks').setEmoji(getEmoji('TROPHY')).setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('btn_view_profile').setLabel('Access Profile').setEmoji('👤').setStyle(ButtonStyle.Secondary)
    );
    container.addActionRowComponents(row);

    await interaction.channel.send(container.toJSON());
}

module.exports = { startLobby, getActiveGamesCount: () => activeGames.size };
