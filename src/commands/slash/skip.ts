import { config } from '../../config';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import { queueManager } from '../../music/QueueManager';
import { createErrorEmbed, createSuccessEmbed, createWarnEmbed } from '../../utils/embedHelper';
import logger from '../../utils/logger';
import { Song } from '../../interfaces/Song';
import { formatDuration } from '../../utils/youtubeUtils';

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('Skips the current song.'),
  cooldown: 1,
  permissions: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const user = interaction.user;

      const queue: Song[] = queueManager.getQueue();
      const queueLength = queueManager.getQueueSize();
      const song = queue[0];
      if (queueLength === 0) {
        const embed = createWarnEmbed(
          'Queue empty',
          `There are no songs to skip.`,
          interaction.user,
        );
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      queueManager.skipTrack();

      const embed = new EmbedBuilder()
        .setColor('#1df364')
        .setTitle(`Song skipped!`)
        .setThumbnail(song.thumbnail)
        .setDescription(`${song.title}`)
        .setTimestamp()
        .setFooter({
          iconURL: user.displayAvatarURL({ size: 64 }),
          text: `${user.tag}`,
        });
      await interaction.editReply({ embeds: [embed] });
      return;
    } catch (error) {
      logger.error('Error:', error);

      const embed = createErrorEmbed(error.message);

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
