import { startBot } from './bot';
import { checkConfig } from './config';
import sequelize from './db/database';
import logger from './utils/logger';
import handleSignals from './utils/signalHandler';
import { generateDependencyReport } from '@discordjs/voice';

import YoutubeTrack from './db/models/YoutubeTrack';

const main = async () => {
  logger.info('Starting bot..');
  checkConfig();
  logger.debug(generateDependencyReport());
  await sequelize.sync({ alter: true });
  await YoutubeTrack.sync({ alter: true });
  await startBot();
  handleSignals();
};

main().catch((error) => {
  console.error('Error in main:', error);
});
