import { Client } from 'discord.js';
import { registerCommands } from '../bot';
import logger from '../utils/logger';

export default function handleReady(client: Client) {
  logger.info(`Logged in as ${client.user?.tag}!`);

  registerCommands(client);
}
