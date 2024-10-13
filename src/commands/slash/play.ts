import path from 'path';
import { config } from '../../config';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import {
  searchYoutube,
  downloadFromYoutube,
  isYoutubeLink,
  getYoutubeUrl,
} from '../../utils/youtubeUtils';
import { createErrorEmbed, createSongEmbed } from '../../utils/embedHelper';
import { Song } from '../../interfaces/Song';
import logger from '../../utils/logger';
import YoutubeTrack from '../../db/models/YoutubeTrack';
import { queueManager } from '../../music/QueueManager';
import { normalizeAudio } from '../../utils/ffmpegUtils';
import isURL from 'validator/lib/isURL';
import SearchCache from '../../db/models/SearchCache';

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
  permissions: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
  async execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString('query');

    if (!query) {
      return await interaction.reply('Please provide a valid query.');
    }

    // Defer the reply as processing might take some time
    await interaction.deferReply();

    try {
      const user = interaction.user;
      const member = interaction.member as GuildMember;

      if (!member.voice.channel) {
        const embed = createErrorEmbed('You need to be in a voice channel to play music.');
        return await interaction.editReply({ embeds: [embed] });
      }

      const voiceChannel = member.voice.channel;

      // Check if the bot is already connected to a voice channel
      if (
        !queueManager.connection ||
        queueManager.connection.joinConfig.channelId !== voiceChannel.id
      ) {
        queueManager.connectToVoiceChannel(voiceChannel);
      }

      // Step 1: Check if the query is a URL
      const url = isURL(query); // Assuming isURL is a utility that checks if query is a valid URL

      let youtubeUrl = '';
      let isPlaylist = false;

      // Step 2: If query is a URL, process the URL directly
      if (url) {
        const result = await getYoutubeUrl(query);
        youtubeUrl = result.url;
        isPlaylist = result.isPlaylist;

        if (isPlaylist) {
          const embed = createErrorEmbed(
            'YouTube playlists are not supported at this time. Please provide a single video URL.',
          );
          return await interaction.editReply({ embeds: [embed] });
        }

        // Step 3: Check if the track already exists in the database
        const existingTrack = await YoutubeTrack.findOne({
          where: { url: youtubeUrl }, // Corrected to use the fetched URL
        });

        if (existingTrack) {
          const song: Song = {
            title: existingTrack.title,
            duration: existingTrack.duration,
            url: existingTrack.url,
            thumbnail: existingTrack.thumbnail,
            requestedBy: user.username,
          };

          logger.info(`Track already exists in the database: ${song.title}`);
          await queueManager.addSong(song);

          const queuePosition = queueManager.getQueueSize();
          const embed = createSongEmbed(song, user, queuePosition + 1);
          return await interaction.editReply({ embeds: [embed] });
        }
      } else {
        const search = await SearchCache.findOne({
          where: { search_term: query },
          include: [{ model: YoutubeTrack, as: 'youtube_track' }],
        });

        if (search && search.youtube_track) {
          logger.debug('hello');
          const cachedTrack = search.youtube_track;
          const song: Song = {
            title: cachedTrack.title,
            duration: cachedTrack.duration,
            url: cachedTrack.url,
            thumbnail: cachedTrack.thumbnail,
            requestedBy: user.username,
          };

          logger.info(`Track exists in cache: ${song.title}`);
          await queueManager.addSong(song);

          const queuePosition = queueManager.getQueueSize();
          const embed = createSongEmbed(song, user, queuePosition + 1);
          return await interaction.editReply({ embeds: [embed] });
        }

        // Step 5: If not found in cache, perform a YouTube search
        const searchData = await searchYoutube(query);
        youtubeUrl = searchData.url;

        // Download and cache the new track
        const fileName = await downloadFromYoutube(youtubeUrl);
        logger.info(`Download completed: ${fileName}`);

        const filePath = path.join(config.YOUTUBE_PATH, fileName);
        normalizeAudio(filePath);

        const newTrack = await YoutubeTrack.create({
          title: searchData.title,
          url: youtubeUrl,
          thumbnail: searchData.thumbnail,
          duration: searchData.duration,
          filename: fileName,
        });
        logger.debug(`Saved new YouTube track: ${newTrack.title}`);

        // Cache the search result
        await SearchCache.create({
          search_term: query,
          youtube_track_id: newTrack.id,
        });

        const song: Song = {
          title: newTrack.title,
          duration: newTrack.duration,
          url: newTrack.url,
          thumbnail: newTrack.thumbnail,
          requestedBy: user.username,
        };

        await queueManager.addSong(song);

        const queuePosition = queueManager.getQueueSize();
        const embed = createSongEmbed(song, user, queuePosition);
        return await interaction.editReply({ embeds: [embed] });
      }

      // Step 6: If no existing track was found and it's a valid YouTube URL, download it
      const searchData = await searchYoutube(query);
      const fileName = await downloadFromYoutube(searchData.url);
      logger.info(`Download completed: ${fileName}`);

      const filePath = path.join(config.YOUTUBE_PATH, fileName);
      normalizeAudio(filePath);

      const newTrack = await YoutubeTrack.create({
        title: searchData.title,
        url: youtubeUrl,
        thumbnail: searchData.thumbnail,
        duration: searchData.duration,
        filename: fileName,
      });
      logger.debug(`Saved new YouTube track: ${newTrack.title}`);

      const song: Song = {
        title: newTrack.title,
        duration: newTrack.duration,
        url: newTrack.url,
        thumbnail: newTrack.thumbnail,
        requestedBy: user.username,
      };

      await queueManager.addSong(song);

      const queuePosition = queueManager.getQueueSize();
      const embed = createSongEmbed(song, user, queuePosition);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error('Error:', error);
      const embed = createErrorEmbed(error.message);
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
