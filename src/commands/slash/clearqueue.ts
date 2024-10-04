import { config } from '../../config';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import songQueueInstance from '../../music/QueueManager';
import {
  createErrorEmbed,
  createSuccessEmbed,
  createWarnEmbed,
} from '../../utils/embedHelper';
import logger from '../../utils/logger';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearqueue')
    .setDescription('Clear the queue'),
  cooldown: 1,
  permissions: [
    PermissionsBitField.Flags.Connect,
    PermissionsBitField.Flags.Speak,
  ],
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const queueLength = songQueueInstance.getQueueLength();
      if (queueLength === 0) {
        const embed = createWarnEmbed(
          'Queue empty',
          `There are no songs in the queue to clear.`,
          interaction.user,
        );
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      songQueueInstance.clearQueue();
      const embed = createSuccessEmbed(
        'Queue cleared!',
        `Removed **${queueLength}** songs from the queue!`,
        interaction.user,
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    } catch (error) {
      logger.error('Error:', error);

      const embed = createErrorEmbed(error.message);

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
