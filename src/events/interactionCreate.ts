import { Interaction } from 'discord.js';

export async function handleInteractionCreate(
  interaction: Interaction,
  commands: Map<string, any>,
) {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  const command = commands.get(commandName);
  if (!command) return;

  await command.execute(interaction, options);

  await interaction.reply({
    content: `Command "${commandName}" executed successfully!`,
    ephemeral: true,
  });
}
