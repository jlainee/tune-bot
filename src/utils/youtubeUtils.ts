import { exec } from 'youtube-dl-exec';
import { isURL } from './utils';

async function searchYoutube(query: string): Promise<string> {
  const res = await exec(`ytsearch1:${query}`, {
    dumpSingleJson: true,
  });

  if (!res || !res.stdout) {
    throw new Error('No video found for the query: ' + query);
  }

  const data = JSON.parse(res.stdout);
  if (!data || data.length === 0) {
    throw new Error('No video found for the query: ' + query);
  }

  return data.entries[0].webpage_url;
}

// @ts-ignore
export async function downloadFromYoutube(query: string): Promise<string> {
  let url: string;

  if (isURL(query)) {
    url = query;
  } else {
    url = await searchYoutube(query);
  }

  /*
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
  */
}
