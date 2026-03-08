const { SlashCommandBuilder } = require('discord.js');
const QuizManager = require('../quiz/QuizManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quiz')
        .setDescription('Quiz Commands')
        .addSubcommand(sub => sub.setName('start').setDescription('Starte eine neue Quiz-Runde')),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'start') {
            await QuizManager.startLobby(interaction);
        }
    }
};
