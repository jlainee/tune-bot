import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import logger from './logger';
import { config } from '../config';

const execPromise = promisify(exec);

/**
 * Normalize the audio file and overwrite the original file.
 *
 * @param filePath - The path to the audio file to normalize
 */
export const normalizeAudio = async (filePath: string): Promise<void> => {
  if (!config.NORMALIZATION_ENABLED) {
    logger.debug(
      `Normalization is disabled. Skipping normalization for: ${filePath}`,
    );
    return;
  }

  const parsedPath = path.parse(filePath);
  const tempFilePath = path.join(
    parsedPath.dir,
    `${parsedPath.name}.normalized${parsedPath.ext}`,
  );
  const ffmpegCommand = `ffmpeg -i "${filePath}" -af loudnorm=I=-14:LRA=11:TP=-1.0 "${tempFilePath}" -y`;

  try {
    await execPromise(ffmpegCommand);
    logger.debug(`Audio normalized: ${tempFilePath}`);

    await fs.rename(tempFilePath, filePath);
    logger.debug(`Original file replaced with normalized version: ${filePath}`);
  } catch (error) {
    logger.error(`Error normalizing audio with FFmpeg: ${error}`);
    throw new Error('Failed to normalize audio.');
  } finally {
    try {
      await fs.unlink(tempFilePath);
    } catch (cleanupError) {}
  }
};
