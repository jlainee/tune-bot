import { startBot } from './bot';

const main = async () => {
  console.log('Starting bot..');
  await startBot();
};

main().catch((error) => {
  console.error('Error in main:', error);
});
