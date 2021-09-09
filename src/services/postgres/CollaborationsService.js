const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addCollaboration({ playlistId, userId }) {
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES ($1, $2, $3) returning id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('User gagal ditambahkan sebagai collaborator');
    }

    // agar cache yang disimpan dihapus ketika terjadi perubahan data
    // await this._cacheService.delete(`playlists:${userId}`);

    return result.rows[0].id;
  }

  async deleteCollaboration({ playlistId, userId }) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Collaborator gagal dihapus');
    }

    // agar cache yang disimpan dihapus ketika terjadi perubahan data
    await this._cacheService.delete(`playlists:${userId}`);
  }
}

module.exports = CollaborationsService;
