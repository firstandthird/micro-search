const Joi = require('joi');
const Boom = require('boom');

exports.removeSingle = {
  method: 'DELETE',
  path: '/remove/single',
  config: {
    validate: {
      payload: {
        index: Joi.string().optional(),
        type: Joi.string().optional(),
        id: Joi.string().required()
      }
    },
  },
  handler(request, h) {
    const server = request.server;
    const settings = server.settings.app;
    if (!server.search) {
      throw Boom.serverUnavailable('No connection to elasticsearch.');
    }

    const data = Object.assign({}, {
      index: settings.search.mainIndex,
      type: settings.search.defaultType
    }, request.payload);

    server.log(['remove', 'pending', 'info'], data);

    const { result, status } = server.search.delete(data);
    const remove = { result, status, data };
    if (remove.status === 200) {
      server.log(['remove', 'success', 'info'], { id: remove.data.id });
    } else {
      server.log(['remove', 'failed', 'error'], remove);
      throw Boom.badRequest('Error removing from index', remove);
    }
    return remove;
  }
};
