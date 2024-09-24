import { startBot } from './bot';
import { checkConfig } from './config';
import logger from './utils/logger';

const main = async () => {
  logger.info('Starting bot..');
  checkConfig();
  await startBot();
};

main().catch((error) => {
  console.error('Error in main:', error);
});
