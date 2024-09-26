import { Sequelize } from 'sequelize';
import logger from '../utils/logger';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: (msg) => logger.debug(`[Sequelize]: ${msg}`),
});

export default sequelize;
