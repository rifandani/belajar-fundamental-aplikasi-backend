/* eslint-disable camelcase */

const mapSongsDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  inserted_at,
  updated_at,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  insertedAt: inserted_at,
  updatedAt: updated_at,
});

const mapPlaylistSongsDBToModel = ({ id, playlist_id, song_id }) => ({
  id,
  playlistId: playlist_id,
  songId: song_id,
});

module.exports = {
  mapSongsDBToModel,
  mapPlaylistSongsDBToModel,
};
