import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import logger from './utils/logger';

dotenv.config();

const defaultDownloadDirectory = path.resolve(process.cwd(), 'downloads');
const resolvedDownloadDirectory =
  process.env.DOWNLOADS_DIRECTORY || defaultDownloadDirectory;
const databasePath = process.env.SQLITE_STORAGE_PATH || './database.sqlite';
const youtubePath = path.join(defaultDownloadDirectory, 'youtube');
const normalizationEnabled = process.env.NORMALIZATION_ENABLED === 'true';

export function checkConfig() {
  logger.debug('Launching application with the following configuration:');

  if (!process.env.DISCORD_TOKEN) {
    logger.error('Missing environment variable: DISCORD_TOKEN');
    throw new Error('Missing environment variable: DISCORD_TOKEN');
  }

  try {
    if (!fs.existsSync(resolvedDownloadDirectory)) {
      logger.warn(
        `Directory ${resolvedDownloadDirectory} does not exist, creating...`,
      );
      fs.mkdirSync(resolvedDownloadDirectory, { recursive: true });
    } else {
      logger.debug(`Directory: [${resolvedDownloadDirectory}] already exists.`);
    }

    fs.accessSync(resolvedDownloadDirectory, fs.constants.W_OK);
    logger.debug(`Directory: [${resolvedDownloadDirectory}] is writable.`);
  } catch (error) {
    logger.error(
      `Error with download directory [${resolvedDownloadDirectory}]:`,
      error,
    );
    throw new Error(
      `Invalid DOWNLOADS_DIRECTORY: [${resolvedDownloadDirectory}]`,
    );
  }

  logger.debug(`DOWNLOADS_DIRECTORY: [${resolvedDownloadDirectory}]`);
  logger.debug('Configuration check complete.');
}

export const config = {
  DATABASE_PATH: databasePath,
  YOUTUBE_PATH: youtubePath,
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  DOWNLOADS_DIRECTORY: resolvedDownloadDirectory,
  NORMALIZATION_ENABLED: normalizationEnabled,
};
