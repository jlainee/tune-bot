import path from 'path';
import { exec } from 'youtube-dl-exec';
import { config } from '../config';
import logger from './logger';

export interface YoutubeData {
  id: string;
  url: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: number;
}

export async function searchYoutube(query: string): Promise<YoutubeData> {
  const res = await exec(`ytsearch1:${query}`, {
    dumpSingleJson: true,
  });

  if (!res || !res.stdout) {
    throw new Error('Search query failed!');
  }

  const data = JSON.parse(res.stdout);
  if (!data.entries || data.entries.length === 0) {
    throw new Error('No results were found!');
  }

  return {
    id: data.entries[0].id,
    url: data.entries[0].webpage_url,
    title: data.entries[0].title,
    channel: data.entries[0].channel,
    thumbnail: data.entries[0].thumbnail,
    duration: data.entries[0].duration,
  };
}

export async function downloadFromYoutube(url: string): Promise<string> {
  const outputPath = path.join(
    config.DOWNLOADS_DIRECTORY,
    'youtube',
    '%(title)s.%(ext)s',
  );

  try {
    const result = await exec(url, {
      output: outputPath,
      noWarnings: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      referer: 'https://www.youtube.com',
      audioFormat: 'mp3',
      extractAudio: true,
      printJson: true,
    });

    const videoInfo = JSON.parse(result.stdout);

    const videoName = path.basename(videoInfo._filename);
    const audioName = videoName.replace(path.extname(videoName), '.mp3');

    return audioName;
  } catch (error) {
    logger.error(`Error downloading video: ${error}`);
    throw new Error('Failed to download video.');
  }
}

export function formatDuration(seconds: number): string {
  if (seconds > 3600) {
    return new Date(seconds * 1000).toISOString().substring(11, 16);
  } else {
    return new Date(seconds * 1000).toISOString().substring(14, 19);
  }
}
