const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  constructor(playlistsService) {
    this._pool = new Pool();
    this._playlistsService = playlistsService;
  }

  async addSongToPlaylist({ playlistId, userId, songId }) {
    // verify playlistId
    await this._playlistsService.verifyPlaylistIsExist(playlistId);

    // only owner or collaborator access
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist');
    }
  }

  async getSongsFromPlaylist(playlistId, userId) {
    // only owner or collaborator access
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
            FROM playlists
            INNER JOIN playlistsongs ON playlistsongs.playlist_id = playlists.id
            INNER JOIN songs ON songs.id = playlistsongs.song_id
            WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows) {
      throw new InvariantError('Lagu dari playlist tidak ditemukan');
    }

    return result.rows;
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    // verify playlist existence
    await this._playlistsService.verifyPlaylistIsExist(playlistId);

    // only owner or collaborator access
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError(
        'Lagu gagal dihapus dari playlist. Id tidak ditemukan',
      );
    }
  }
}

module.exports = PlaylistSongsService;
