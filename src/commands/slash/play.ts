import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import { searchYoutube, formatDuration } from '../../utils/youtubeUtils';

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

    interaction
      .deferReply()
      .then(() => searchYoutube(query))
      .then((data) => {
        const user = interaction.user;
        const songName = data.title.slice(0, 32).concat('..');
        const duration = formatDuration(data.duration);

        const embed = new EmbedBuilder()
          .setColor('#1df364')
          .setTitle('Song added to Queue! 🎵')
          .setDescription(`[${songName}](${data.url}) **[${duration}]**`)
          .setTimestamp()
          .setFooter({
            iconURL: user.displayAvatarURL({ size: 64 }),
            text: `${user.tag}`,
          });

        interaction
          .editReply({ embeds: [embed] })
          .catch((error) => console.error('Error editing reply:', error));
      })
      .catch((error) => {
        console.error(error);
        const embed = new EmbedBuilder()
          .setColor('#f93207')
          .setDescription(`${error.message} :x:`);

        interaction
          .editReply({ embeds: [embed] })
          .catch((error) => console.error('Error editing reply:', error));
      });
  },
};
