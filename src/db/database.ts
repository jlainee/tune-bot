import { Sequelize } from 'sequelize';
import { config } from '../config';
import logger from '../utils/logger';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: config.DATABASE_PATH,
  logging: (msg) => logger.debug(`[Sequelize]: ${msg}`),
});

export default sequelize;
