import { EmbedBuilder, User } from 'discord.js';
import { Song } from '../interfaces/Song';
import { formatDuration } from './youtubeUtils';

export const createSongEmbed = (song: Song, user: User, position: number) => {
  const duration = formatDuration(song.duration);

  const embed = new EmbedBuilder()
    .setColor('#1df364')
    .setTitle('Song added to Queue! 🎵')
    .setThumbnail(song.thumbnail)
    .setDescription(`[${song.title}](${song.url})`)
    .setFields([
      { name: 'Duration:', value: `**${duration}**`, inline: true },
      { name: 'Queue:', value: `**#${position}**`, inline: true },
    ])
    .setTimestamp()
    .setFooter({
      iconURL: user.displayAvatarURL({ size: 64 }),
      text: `${user.tag}`,
    });

  return embed;
};

export const createSuccessEmbed = (
  title: string,
  description: string,
  user: User,
) => {
  const embed = new EmbedBuilder()
    .setColor('#1df364')
    .setTitle(title)
    .setDescription(description)
    .setTimestamp()
    .setFooter({
      iconURL: user.displayAvatarURL({ size: 64 }),
      text: `${user.tag}`,
    });

  return embed;
};

export const createWarnEmbed = (
  title: string,
  description: string,
  user: User,
) => {
  const embed = new EmbedBuilder()
    .setColor('#ffb001')
    .setTitle(title)
    .setDescription(description)
    .setTimestamp()
    .setFooter({
      iconURL: user.displayAvatarURL({ size: 64 }),
      text: `${user.tag}`,
    });

  return embed;
};

export const createErrorEmbed = (message: string) => {
  const embed = new EmbedBuilder()
    .setColor('#f93207')
    .setDescription(`${message} :x:`);

  return embed;
};
