import { Client } from 'discord.js';

export default function handleReady(client: Client) {
    console.log(`Logged in as ${client.user?.tag}!`);
}