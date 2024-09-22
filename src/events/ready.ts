import { Client } from 'discord.js';
import { registerCommands } from '../bot';

export default function handleReady(client: Client) {
  console.log(`Logged in as ${client.user?.tag}!`);

  registerCommands(client);
}
