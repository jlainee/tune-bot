import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const { DISCORD_TOKEN, DOWNLOADS_DIRECTORY } = process.env;

if (!DISCORD_TOKEN) {
  throw new Error('Missing environment variables');
}

const defaultDownloadDirectory = path.resolve(process.cwd(), 'downloads');
const resolvedDownloadDirectory =
  DOWNLOADS_DIRECTORY || defaultDownloadDirectory;

// Function to check and validate configuration
export function checkConfig() {
  console.log('Launching application with the following configuration:');

  // Check for DISCORD_TOKEN
  if (!DISCORD_TOKEN) {
    throw new Error('Missing environment variable: DISCORD_TOKEN');
  }
  console.log(`DISCORD_TOKEN: ${DISCORD_TOKEN ? 'Present' : 'Missing'}`);

  // Ensure download directory exists or create it
  try {
    if (!fs.existsSync(resolvedDownloadDirectory)) {
      console.log(
        `Directory ${resolvedDownloadDirectory} does not exist, creating...`,
      );
      fs.mkdirSync(resolvedDownloadDirectory, { recursive: true });
    } else {
      console.log(`Directory ${resolvedDownloadDirectory} already exists.`);
    }

    // Check if the directory is writable
    fs.accessSync(resolvedDownloadDirectory, fs.constants.W_OK);
    console.log(`Directory ${resolvedDownloadDirectory} is writable.`);
  } catch (error) {
    console.error(
      `Error with download directory ${resolvedDownloadDirectory}:`,
      error,
    );
    throw new Error(
      `Invalid DOWNLOADS_DIRECTORY: ${resolvedDownloadDirectory}`,
    );
  }

  console.log(`DOWNLOADS_DIRECTORY: ${resolvedDownloadDirectory}`);
  console.log('Configuration check complete.');
}

// Export the configuration object
export const config = {
  DISCORD_TOKEN,
  DOWNLOADS_DIRECTORY: resolvedDownloadDirectory,
};
