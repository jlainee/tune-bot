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

    // Defer the reply as downloading might take some time
    await interaction.deferReply();

    try {
      const user = interaction.user;
      const member = interaction.member as GuildMember;

      if (!member.voice.channel) {
        return await interaction.reply('You need to be in a voice channel to play music.');
      }

      const voiceChannel = member.voice.channel;

      // Check if the bot is already connected to a voice channel
      if (
        !queueManager.connection ||
        queueManager.connection.joinConfig.channelId !== voiceChannel.id
      ) {
        // Connect to the voice channel
        queueManager.connectToVoiceChannel(voiceChannel);
      }
      const { url, isPlaylist } = await getYoutubeUrl(query);

      if (isPlaylist) {
        return await interaction.reply(
          'YouTube playlists are not supported at this time. Please provide a single video URL.',
        );
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
        await queueManager.addSong(song);

        const queuePosition = queueManager.getQueueSize();

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
        queueManager.addSong(song);

        const queuePosition = queueManager.getQueueSize();

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
