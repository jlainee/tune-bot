import { exec } from 'youtube-dl-exec';
import { isURL } from './utils';

// @ts-ignore
export async function downloadFromYoutube(url: string): Promise<string> {
  const video = await exec(url, {
    dumpSingleJson: true,
    noWarnings: true,
    preferFreeFormats: true,
    youtubeSkipDashManifest: true,
    referer: 'https://www.youtube.com',
  });

  if (!video || !video.url) {
    console.error('No video url found');
  }
}
