import { startBot } from './bot';
import { checkConfig } from './config';
import sequelize from './db/database';
import logger from './utils/logger';
import handleSignals from './utils/signalHandler';
import { generateDependencyReport } from '@discordjs/voice';
import { YoutubeTrack, SearchCache } from './db/models/index';

const main = async () => {
  logger.info('Starting bot..');
  checkConfig();
  logger.debug(generateDependencyReport());
  await sequelize.sync();
  await YoutubeTrack.sync();
  await SearchCache.sync();
  await startBot();
  handleSignals();
};

main().catch((error) => {
  console.error('Error in main:', error);
});
