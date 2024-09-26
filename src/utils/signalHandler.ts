import sequelize from '../db/database';

export default function handleSignals() {
  process.on('SIGINT', () => {
    console.log('Received SIGINT. Exiting...');
    sequelize.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Exiting...');
    sequelize.close();
    process.exit(0);
  });
}
