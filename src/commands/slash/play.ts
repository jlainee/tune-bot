import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { PermissionsBitField } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Enter the name of the song or the URL')
        .setRequired(true),
    ),
  cooldown: 1,
  permissions: [
    PermissionsBitField.Flags.Connect,
    PermissionsBitField.Flags.Speak,
  ],
  async execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString('query');

    await interaction.reply(`Attempting to play song: ${query}`);
  },
};
