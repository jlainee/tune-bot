import YoutubeTrack from './YoutubeTrack.js';
import SearchCache from './SearchCache.js';

// Define associations
YoutubeTrack.hasMany(SearchCache, {
  foreignKey: 'youtube_track_id',
});
SearchCache.belongsTo(YoutubeTrack, {
  foreignKey: 'youtube_track_id',
  as: 'youtube_track',
});

// Export the models
export { YoutubeTrack, SearchCache };
