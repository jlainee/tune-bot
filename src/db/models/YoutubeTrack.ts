// YoutubeTrack.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import SearchCache from './SearchCache';

class YoutubeTrack extends Model {
  declare id: number;
  declare title: string;
  declare url: string;
  declare thumbnail: string;
  declare duration: number;
  declare filename: string;
}

YoutubeTrack.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'youtube_tracks',
  },
);

export default YoutubeTrack;
