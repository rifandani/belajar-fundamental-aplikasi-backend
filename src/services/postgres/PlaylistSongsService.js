const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistSongsService {
  constructor(playlistsService, cacheService) {
    this._pool = new Pool();
    this._playlistsService = playlistsService;
    this._cacheService = cacheService;
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

    // agar cache yang disimpan dihapus ketika terjadi perubahan data
    await this._cacheService.delete(`playlistsongs:${playlistId}`);
  }

  async getSongsFromPlaylist(playlistId, userId) {
    try {
      // only owner or collaborator access
      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

      // get playlistsongs:playlistId cache first
      const result = await this._cacheService.get(
        `playlistsongs:${playlistId}`,
      );
      return JSON.parse(result);
    } catch (err) {
      if (err instanceof AuthorizationError) {
        throw new AuthorizationError(
          'Anda tidak berhak mengakses resource ini',
        );
      }

      const query = {
        text: `SELECT songs.id, songs.title, songs.performer
              FROM playlists
              INNER JOIN playlistsongs ON playlistsongs.playlist_id = playlists.id
              INNER JOIN songs ON songs.id = playlistsongs.song_id
              WHERE playlists.id = $1`,
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new InvariantError('Lagu dari playlist tidak ditemukan');
      }

      // save playlistsongs:playlistId to cache
      await this._cacheService.set(
        `playlistsongs:${playlistId}`,
        JSON.stringify(result.rows),
      );

      return result.rows;
    }
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

    // agar cache yang disimpan dihapus ketika terjadi perubahan data
    await this._cacheService.delete(`playlistsongs:${playlistId}`);
  }
}

module.exports = PlaylistSongsService;
