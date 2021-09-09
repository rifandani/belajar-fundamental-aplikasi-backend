const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    // agar cache yang disimpan dihapus ketika terjadi perubahan data
    await this._cacheService.delete(`playlists:${owner}`);

    return result.rows[0].id;
  }

  async getPlaylistsByUserId(userId) {
    try {
      // get playlists:userId cache first
      const result = await this._cacheService.get(`playlists:${userId}`);
      return JSON.parse(result);
    } catch (err) {
      const query = {
        text: `SELECT playlists.id, playlists.name, users.username
             FROM playlists
             INNER JOIN users ON playlists.owner = users.id
             LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
             WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
        values: [userId],
      };

      const result = await this._pool.query(query);

      // save song to cache
      await this._cacheService.set(
        `playlists:${userId}`,
        JSON.stringify(result.rows),
      );

      return result.rows;
    }
  }

  async deletePlaylistByPlaylistId({ playlistId, userId }) {
    // verify playlists owner access
    await this.verifyPlaylistOwner(playlistId, userId);

    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }

    // agar cache yang disimpan dihapus ketika terjadi perubahan data
    await this._cacheService.delete(`playlists:${userId}`);
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    const playlist = result.rows[0];

    if (playlist.owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistIsExist(playlistId) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    const query = {
      text: `SELECT playlists.id
             FROM playlists
             INNER JOIN users ON playlists.owner = users.id
             LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
             WHERE (playlists.owner = $1 OR collaborations.user_id = $1) AND
             playlists.id = $2`,
      values: [userId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = PlaylistsService;
