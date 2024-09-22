import { Collection, SlashCommandBuilder } from 'discord.js';

export interface Command {
  data: SlashCommandBuilder;
  permissions?: string[];
  cooldown?: number;
  execute(...args: any): any;
}

export const commands = new Collection<string, Command>();
