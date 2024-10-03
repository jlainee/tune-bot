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
import songQueueInstance from '../../music/QueueManager';
import { Song } from '../../interfaces/Song';
import { createErrorEmbed, createSongEmbed } from '../../utils/embedHelper';

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
      const user = interaction.user;

      const existingTrack = await YoutubeTrack.findOne({
        where: { url: query },
      });
      if (existingTrack) {
        const song: Song = {
          title: existingTrack.title,
          duration: existingTrack.duration,
          url: existingTrack.url,
          thumbnail: existingTrack.thumbnail,
          requestedBy: user.username,
        };
        logger.info(`Track exists! ${song.title}`);
        const queuePosition = songQueueInstance.addSong(song);

        const embed = createSongEmbed(song, user, queuePosition + 1);
        await interaction.editReply({ embeds: [embed] });
        return;
      } else {
        const data = await searchYoutube(query);

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

        const song: Song = {
          title: data.title,
          duration: data.duration,
          url: data.url,
          thumbnail: data.thumbnail,
          requestedBy: user.username,
        };
        const queuePosition = songQueueInstance.addSong(song);

        const embed = createSongEmbed(song, user, queuePosition + 1);
        await interaction.editReply({ embeds: [embed] });
        return;
      }
    } catch (error) {
      logger.error('Error:', error);

      const embed = createErrorEmbed(error.message);

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
