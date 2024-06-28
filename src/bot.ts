import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from './config';
import handleReady from './events/ready';
import handleSignals from './utils/signalHandler';
import { downloadFromYoutube } from './utils/youtubeUtil';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once(Events.ClientReady, (client: Client) => handleReady(client));

// client.login(config.DISCORD_TOKEN);

handleSignals();
