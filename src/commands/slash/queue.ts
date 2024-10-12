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
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Displays the current song queue with the list of upcoming tracks.'),
  cooldown: 1,
  permissions: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const user = interaction.user;
      const guildName = interaction.guild?.name;

      const queue: Song[] = queueManager.getQueue();
      const queueLength = queueManager.getQueueSize();
      if (queueLength === 0) {
        const embed = createWarnEmbed(
          'Queue empty',
          `There are no songs in queue.`,
          interaction.user,
        );
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const songsPerPage = 10;

      const embed = new EmbedBuilder()
        .setColor('#1df364')
        .setTitle(`${guildName}'s Queue 🎶`)
        .setDescription(
          queue
            .map(
              (song, index) =>
                `\`${index + 1}.\` [${song.title}](${song.url}) [${formatDuration(song.duration)}]`,
            )
            .join('\n'),
        )
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
