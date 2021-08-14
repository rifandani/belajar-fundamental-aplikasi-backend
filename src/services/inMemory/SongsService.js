const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._songs = [];
  }

  addSong({ title, year, performer, genre, duration }) {
    const id = `song-${nanoid(16)}`;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const newSong = {
      title,
      year: Number(year),
      performer,
      genre,
      duration: Number(duration),
      id,
      insertedAt,
      updatedAt,
    };

    this._songs.push(newSong);

    const isSuccess = this._songs.filter((song) => song.id === id).length > 0;

    if (!isSuccess) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return id;
  }

  getSongs() {
    return this._songs;
  }

  getSongById(songId) {
    const song = this._songs.filter((el) => el.id === songId)[0];

    if (!song) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return song;
  }

  editSongById(songId, { title, year, performer, genre, duration }) {
    const index = this._songs.findIndex((song) => song.id === songId);

    if (index === -1) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }

    const updatedAt = new Date().toISOString();

    this._songs[index] = {
      ...this._songs[index],
      title,
      year: Number(year),
      performer,
      genre,
      duration: Number(duration),
      updatedAt,
    };
  }

  deleteSongById(songId) {
    const index = this._songs.findIndex((song) => song.id === songId);

    if (index === -1) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    this._songs.splice(index, 1);
  }
}

module.exports = SongsService;
