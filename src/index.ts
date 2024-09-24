import { startBot } from './bot';
import { checkConfig } from './config';

const main = async () => {
  console.log('Starting bot..');
  checkConfig();
  await startBot();
};

main().catch((error) => {
  console.error('Error in main:', error);
});
