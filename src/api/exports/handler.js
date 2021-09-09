const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(producerService, playlistService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistSongsHandler(request, h) {
    // validate req.payload
    this._validator.validateExportPlaylistPayload(request.payload);

    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;

    // call playlists service
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const message = {
      // userId, ga perlu
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    // call producer service
    await this._producerService.sendMessage(
      'export:playlists',
      JSON.stringify(message),
    );

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
