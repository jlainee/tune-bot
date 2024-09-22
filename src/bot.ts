import * as fs from 'node:fs';
import path from 'node:path';
import { config } from './config';
import {
  Client,
  Collection,
  CommandInteraction,
  Events,
  Interaction,
  GatewayIntentBits,
  REST,
  Routes,
  ApplicationCommandDataResolvable,
  ApplicationCommand,
} from 'discord.js';
import { Command, commands } from './interfaces/Command';
import handleReady from './events/ready';
import handleSignals from './utils/signalHandler';
import { downloadFromYoutube } from './utils/youtubeUtils';
import { handleInteractionCreate } from './events/interactionCreate';

export const startBot = async () => {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });

  client.once(Events.ClientReady, (client) => {
    handleReady(client);
  });

  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
      await handleInteractionCreate(interaction, commands);
    } catch (error) {
      console.error('Error handling interaction:', error);
      await interaction.reply({
        content: 'There was an error while processing your command.',
        ephemeral: true,
      });
    }
  });

  await client.login(config.DISCORD_TOKEN);
  await registerCommands(client);
  handleSignals();
};

export const registerCommands = async (client: Client) => {
  const rest = new REST().setToken(config.DISCORD_TOKEN);
  const appCommands = new Array<ApplicationCommandDataResolvable>();

  const commandFiles = fs
    .readdirSync(path.join(__dirname, 'commands', 'slash'))
    .filter((file) => file.endsWith('.ts'));

  for (const file of commandFiles) {
    const command = require(`./commands/slash/${file}`) as Command;

    appCommands.push(command.data);
    commands.set(command.data.name, command);
  }

  await rest.put(Routes.applicationCommands(client.user!.id), {
    body: appCommands,
  });
};
