import { exec } from 'youtube-dl-exec';
import { isURL } from './utils';

export interface YoutubeData {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  duration: number;
}

export async function searchYoutube(query: string): Promise<YoutubeData> {
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

  return {
    id: data.entries[0].id,
    url: data.entries[0].webpage_url,
    title: data.entries[0].title,
    thumbnail: data.entries[0].thumbnail,
    duration: data.entries[0].duration,
  };
}

// @ts-ignore
export async function downloadFromYoutube(query: string): Promise<string> {
  let url: string;

  if (isURL(query)) {
    url = query;
  } else {
    const youtubeQuery = await searchYoutube(query);
    url = youtubeQuery.url;
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
