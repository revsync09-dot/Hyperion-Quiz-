const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { ContainerBuilder, SectionBuilder, TextDisplayBuilder, SeparatorBuilder } = require('../utils/uiBuilders');
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
      // Decode HTML entities (basic)
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
        return interaction.reply({ content: "This bot only works inside the Hyperion server.", ephemeral: true });
    }

    if (activeGames.has(interaction.channelId)) {
        return interaction.reply({ content: "A quiz is already active in this channel!", ephemeral: true });
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
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`🎮 **Hyperion Quiz: Recruitment Phase**\nClick Join to participate.\n\nThe quiz starts in 15 seconds.`))
        );
        
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('quiz_join').setLabel('Join').setStyle(ButtonStyle.Primary)
    );
    container.addActionRowComponents(row);

    const message = await interaction.reply({ ...container.toJSON(), fetchReply: true });

    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

    collector.on('collect', async i => {
        if (i.customId === 'quiz_join') {
            if (game.players.has(i.user.id)) {
                return i.reply({ content: "You're already in!", ephemeral: true });
            }
            game.players.set(i.user.id, { points: 0, correct_answers: 0, username: i.user.username, avatar: i.user.displayAvatarURL() });
            await i.reply({ content: "You joined the quiz! 🚀", ephemeral: true });
        }
    });

    collector.on('end', async () => {
        if (game.players.size === 0) {
            activeGames.delete(interaction.channelId);
            return interaction.followUp("Nobody joined the quiz. Session ended. 😢");
        }
        await startNextRound(interaction, game);
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
        return interaction.followUp("Failed to fetch questions. Aborting quiz.");
    }

    const container = new ContainerBuilder()
        .setAccentColor(0x9d4edd)
        .addSectionComponents(
            new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`📊 **Round ${game.round} / 5**\nDifficulty: **${roundInfo.level}** (${roundInfo.points} pts)\nCategory: **${category.name}**\n\n**Question:**\n${qData.question}`))
        );

    const row = new ActionRowBuilder();
    qData.choices.forEach((choice, idx) => {
        row.addComponents(new ButtonBuilder().setCustomId(`quiz_ans_${idx}`).setLabel(choice).setStyle(ButtonStyle.Secondary));
    });
    container.addActionRowComponents(row);

    const msg = await interaction.channel.send(container.toJSON());
    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

    const answered = new Set();
    collector.on('collect', async i => {
        if (!game.players.has(i.user.id)) {
            return i.reply({ content: "You are not part of this quiz session!", ephemeral: true });
        }
        if (answered.has(i.user.id)) {
            return i.reply({ content: "You already answered!", ephemeral: true });
        }

        answered.add(i.user.id);
        const choiceIdx = parseInt(i.customId.split('_')[2]);
        const playerData = game.players.get(i.user.id);

        if (choiceIdx === qData.correctIndex) {
            playerData.points += roundInfo.points;
            playerData.correct_answers++;
            await i.reply({ content: `✅ Correct! (+${roundInfo.points} pts)`, ephemeral: true });
        } else {
            await i.reply({ content: `❌ Wrong! The correct answer was: **${qData.choices[qData.correctIndex]}**`, ephemeral: true });
        }
    });

    collector.on('end', async () => {
        await startNextRound(interaction, game);
    });
}

async function endQuiz(interaction, game) {
    activeGames.delete(game.channelId);

    const playersArr = Array.from(game.players.entries()).map(([discord_id, data]) => ({ discord_id, ...data }));
    playersArr.sort((a, b) => b.points - a.points);

    // Save Game Record
    const { data: gameRecord, error: gameError } = await supabase.from('quiz_games').insert({
        guild_id: PRIMARY_GUILD_ID,
        ended_at: new Date(),
        difficulty_rounds: 5
    }).select().single();

    if (gameError) console.error('[DEBUG] Game record error:', gameError);

    // Update Users and Save Results
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

            // Log results
            if (gameRecord) {
              await supabase.from('quiz_results').insert({
                  quiz_id: gameRecord.id,
                  user_id: dbUser.id,
                  score: pd.points,
                  position: i + 1
              });
              
              // Log economy
              if (pd.points > 0) {
                await User.updateCoins(pd.discord_id, Math.floor(pd.points * 0.5), 'quiz_reward');
              }
            }
        }
    }

    let resultText = '';
    const emojiMap = { 1: '🥇', 2: '🥈', 3: '🥉' };

    playersArr.forEach((p, idx) => {
        const rank = idx + 1;
        const reward = Math.floor(p.points * 0.5);
        resultText += `${emojiMap[rank] || rank + ')'} **<@${p.discord_id}>** — ${p.points} Pts (+${reward} 🪙)\n`;
    });

    const container = new ContainerBuilder()
        .setAccentColor(0x6c63ff)
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`🏁 **Hyperion Quiz: Tournament Results**\nThe game has concluded.`))
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(true))
        .addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(resultText || 'No one participated.'))
        );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('btn_play_again').setLabel('Play Again').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('btn_view_leaderboard').setLabel('Leaderboard').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('btn_view_profile').setLabel('My Profile').setStyle(ButtonStyle.Secondary)
    );
    container.addActionRowComponents(row);

    await interaction.channel.send(container.toJSON());
}

module.exports = { startLobby };
