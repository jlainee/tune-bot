import path from 'path';
import { config } from '../../config';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import {
  searchYoutube,
  downloadFromYoutube,
  isYoutubeLink,
} from '../../utils/youtubeUtils';
import { createErrorEmbed, createSongEmbed } from '../../utils/embedHelper';
import { Song } from '../../interfaces/Song';
import logger from '../../utils/logger';
import YoutubeTrack from '../../db/models/YoutubeTrack';
import songQueueInstance from '../../music/QueueManager';
import { normalizeAudio } from '../../utils/ffmpegUtils';

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
      let url: string | null = null;

      if (isYoutubeLink(query)) {
        url = query;
      } else {
        const data = await searchYoutube(query);
        if (data && data.url) {
          url = data.url;
        } else {
          throw new Error('Could not find a Youtube video matching the query.');
        }
      }

      const existingTrack = await YoutubeTrack.findOne({
        where: { url },
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

        const fileName = await downloadFromYoutube(query);
        logger.info(`Download completed: ${fileName}`);

        const filePath = path.join(config.YOUTUBE_PATH, fileName);
        normalizeAudio(filePath);

        const track = await YoutubeTrack.create({
          title: data.title,
          url: data.url,
          thumbnail: data.thumbnail,
          duration: data.duration,
          filename: fileName,
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
