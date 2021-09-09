const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongsDBToModel } = require('../../utils');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({ title, year, performer, genre, duration }) {
    const id = `song-${nanoid(16)}`;
    const insertedAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $7) RETURNING id',
      values: [
        id,
        title,
        Number(year),
        performer,
        genre,
        Number(duration),
        insertedAt,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    // agar cache yang disimpan dihapus ketika terjadi perubahan data
    await this._cacheService.delete('songs');

    return result.rows[0].id;
  }

  async getSongs() {
    try {
      // get songs cache first
      const result = await this._cacheService.get('songs');
      return JSON.parse(result);
    } catch (err) {
      // if fails, continue get from database database
      const result = await this._pool.query(
        'SELECT id, title, performer FROM songs',
      );

      const mappedSongs = result.rows.map(mapSongsDBToModel);

      // save songs to cache
      await this._cacheService.set('songs', JSON.stringify(mappedSongs));

      return mappedSongs;
    }
  }

  async getSongById(songId) {
    try {
      // get song cache first
      const result = await this._cacheService.get(`songs:${songId}`);
      return JSON.parse(result);
    } catch (err) {
      const query = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [songId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Lagu tidak ditemukan');
      }

      const mappedSongs = result.rows.map(mapSongsDBToModel)[0];

      // save song to cache
      await this._cacheService.set(
        `songs:${songId}`,
        JSON.stringify(mappedSongs),
      );

      return mappedSongs;
    }
  }

  async editSongById(songId, { title, year, performer, genre, duration }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [
        title,
        Number(year),
        performer,
        genre,
        Number(duration),
        updatedAt,
        songId,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }

    // agar cache yang disimpan dihapus ketika terjadi perubahan data
    await this._cacheService.delete('songs');
    await this._cacheService.delete(`songs:${songId}`);
  }

  async deleteSongById(songId) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    // agar cache yang disimpan dihapus ketika terjadi perubahan data
    await this._cacheService.delete('songs');
    await this._cacheService.delete(`songs:${songId}`);
  }

  async verifySongIsExist(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }
}

module.exports = SongsService;
