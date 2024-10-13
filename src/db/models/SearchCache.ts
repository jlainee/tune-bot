// SearchCache.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import YoutubeTrack from './YoutubeTrack';

class SearchCache extends Model {
  declare id: number;
  declare search_term: string;
  declare youtube_track_id: number;

  // Optional: Define the associated YoutubeTrack for TypeScript
  declare youtube_track?: YoutubeTrack;
}

SearchCache.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    search_term: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    youtube_track_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'youtube_tracks',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'search_cache',
  },
);

export default SearchCache;
