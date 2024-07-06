import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import { searchYoutube } from '../../utils/youtubeUtils';

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
    if (query === null) {
      await interaction.reply('Please prove a valid query.');
      return;
    }

    const data = await searchYoutube(query);

    const user = interaction.user;
    const songName = data.title.slice(0, 28).concat('..');
    const duration = '03:32';

    const embed = new EmbedBuilder()
      .setColor('#1df364')
      .setTitle('Song added to Queue! 🎵')
      .setDescription(`[${songName}](${query}) **[${duration}]**`)
      .setTimestamp()
      .setFooter({
        iconURL: user.displayAvatarURL({ size: 64 }),
        text: `${user.tag}`,
      });

    await interaction.reply({ embeds: [embed] });
  },
};
