const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    // validate req.payload
    this._validator.validatePostCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: ownerId } = request.auth.credentials;

    // call playlists service
    await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);

    // call collaborations service
    const collaborationId = await this._collaborationsService.addCollaboration({
      playlistId,
      userId,
    });

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    // validate req.payload
    this._validator.validateDeleteCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: ownerId } = request.auth.credentials;

    // call playlists service
    await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);

    // call collaborations service
    await this._collaborationsService.deleteCollaboration({
      playlistId,
      userId,
    });

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
