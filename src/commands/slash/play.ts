import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import {
  searchYoutube,
  formatDuration,
  downloadFromYoutube,
} from '../../utils/youtubeUtils';
import logger from '../../utils/logger';
import YoutubeTrack from '../../db/models/YoutubeTrack';

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
      await interaction.reply('Please provide a valid query.');
      return;
    }

    // Defer the reply as downloading might take some time
    await interaction.deferReply();

    try {
      const data = await searchYoutube(query);
      const user = interaction.user;
      const title = data.title.slice(0, 32).concat('..');
      const duration = formatDuration(data.duration);
      const queue = 'N/A';

      const downloadPath = await downloadFromYoutube(data.url);
      logger.info(`Download completed: ${downloadPath}`);

      const track = await YoutubeTrack.create({
        title: data.title,
        url: data.url,
        thumbnail: data.thumbnail,
        duration: data.duration,
        filepath: downloadPath,
      });
      logger.debug(`Saved YouTube track: ${track.title}`);

      const embed = new EmbedBuilder()
        .setColor('#1df364')
        .setTitle('Song added to Queue! 🎵')
        .setThumbnail(data.thumbnail)
        .setDescription(`[${title}](${data.url})`)
        .setFields([
          { name: 'Duration:', value: `**${duration}**`, inline: true },
          { name: 'Queue:', value: `**#${queue}**`, inline: true },
        ])
        .setTimestamp()
        .setFooter({
          iconURL: user.displayAvatarURL({ size: 64 }),
          text: `${user.tag}`,
        });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#f93207')
        .setDescription(`${error.message} :x:`);

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
