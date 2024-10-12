import fs from 'fs';
import path from 'path';
import { config } from '../config';
import logger from '../utils/logger';
import {
  AudioPlayer,
  AudioPlayerStatus,
  DiscordGatewayAdapterCreator,
  VoiceConnection,
  createAudioPlayer,
  createAudioResource,
  demuxProbe,
  joinVoiceChannel,
} from '@discordjs/voice';
import { Song } from '../interfaces/Song';
import { SongQueue } from './SongQueue';
import YoutubeTrack from '../db/models/YoutubeTrack';
import play from 'play-dl';

export class QueueManager {
  private queue: SongQueue;
  private player: AudioPlayer;
  public connection: VoiceConnection | null = null;

  constructor() {
    this.queue = new SongQueue();
    this.player = createAudioPlayer();

    this.player.on(AudioPlayerStatus.Idle, () => {
      logger.debug('Player is idle. Playing the next song..');
      this.playNextTrack();
    });

    this.player.on(AudioPlayerStatus.Playing, () => {
      logger.info('Audio is now playing.');
    });

    this.player.on(AudioPlayerStatus.Buffering, () => {
      logger.info('Audio is buffering...');
    });

    this.player.on('error', (error) => {
      logger.error(`Error in audio player: ${error.message}`);
      this.playNextTrack();
    });
  }

  connectToVoiceChannel(channel: any): void {
    this.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
    });

    this.connection.subscribe(this.player);
  }

  async addSong(song: Song): Promise<void> {
    this.queue.addSong(song);
    logger.info(`Added ${song.title} to the queue`);

    if (this.player.state.status === AudioPlayerStatus.Idle) {
      await this.playNextTrack();
    }
  }

  private async playNextTrack(): Promise<void> {
    if (this.queue.isEmpty()) {
      logger.info('Queue is empty, stopping playback.');
      return;
    }

    const nextSong = this.queue.getNextSong();
    if (nextSong) {
      logger.info(`Now playing: ${nextSong.title}`);

      const youtubeTrack = await YoutubeTrack.findOne({ where: { url: nextSong.url } });
      if (youtubeTrack && youtubeTrack.filename) {
        const filePath = path.join(config.YOUTUBE_PATH, youtubeTrack.filename);
        logger.info(`Playing file: ${filePath}`);

        const resource = await this.createAudioResourceFromFile(filePath);
        if (resource) {
          this.player.play(resource);
        }
      } else {
        logger.error('Could not find the file associated with the URL.');
      }
    }
  }

  skipTrack(): void {
    logger.info('Skipping the current track...');
    this.queue.skipSong();
    this.playNextTrack();
  }

  private async createAudioResourceFromFile(filePath: string) {
    try {
      const fileStream = fs.createReadStream(filePath);
      const { stream, type } = await demuxProbe(fileStream);
      const resource = createAudioResource(stream, { inputType: type });

      return resource;
    } catch (error) {
      logger.error(`Failed to create audio resource: ${error.message}`);
      return null;
    }
  }

  // Currently not working
  private async createAudioResourceFromPlayDL(url: string) {
    try {
      logger.info(`Fetching audio stream for URL: ${url}`);

      const streamInfo = await play.stream(url);

      // Create an audio resource from the fetched stream
      const resource = createAudioResource(streamInfo.stream, {
        inputType: streamInfo.type,
      });

      logger.info('Audio resource created successfully using play-dl');
      return resource;
    } catch (error) {
      logger.error(`Failed to create audio resource using play-dl: ${error.message}`);
      return null;
    }
  }

  clearQueue(): void {
    this.queue.clearQueue();
    logger.info('Cleared the queue');
    if (this.connection) {
      this.connection.destroy(); // Disconnect from the voice channel
    }
  }

  getQueueSize(): number {
    return this.queue.getQueueLength();
  }

  getQueue(): Song[] {
    return this.queue.getQueue();
  }
}

export const queueManager = new QueueManager();
