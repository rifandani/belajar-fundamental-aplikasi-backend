/* eslint-disable operator-linebreak */

const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistsService, playlistSongsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    // validate req.payload
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    // call playlists service
    const playlistId = await this._playlistsService.addPlaylist({
      name,
      owner,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsByUserIdHandler(request) {
    const { id: userId } = request.auth.credentials;

    // call playlists service
    const playlists = await this._playlistsService.getPlaylistsByUserId(userId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByPlaylistIdHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;

    // call playlists service
    await this._playlistsService.deletePlaylistByPlaylistId({
      playlistId,
      userId,
    });

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    // validate req.payloadd
    this._validator.validatePostSongToPlaylistPayload(request.payload);

    const { songId } = request.payload;
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    // verify song is exist
    await this._songsService.verifySongIsExist(songId);

    // call playlistsong service
    await this._playlistSongsService.addSongToPlaylist({
      playlistId,
      songId,
      userId,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistHandler(request) {
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    // call playlistsong service
    const songsFromPlaylist =
      await this._playlistSongsService.getSongsFromPlaylist(playlistId, userId);

    return {
      status: 'success',
      data: {
        songs: songsFromPlaylist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    // validate req.payload
    this._validator.validateDeleteSongFromPlaylistPayload(request.payload);

    const { songId } = request.payload;
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    // call playlistsong service
    await this._playlistSongsService.deleteSongFromPlaylist(
      playlistId,
      songId,
      userId,
    );

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;
