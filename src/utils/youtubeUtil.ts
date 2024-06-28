import fs from 'fs';
import path from 'path';

const downloader = require('youtube-dl-exec');

// @ts-ignore
export async function downloadFromYoutube(url: string): Promise<string> {
  const video = await downloader.exec(url, {
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
