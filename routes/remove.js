const Joi = require('joi');
const Boom = require('boom');

exports.removeByType = {
  method: 'DELETE',
  path: '/remove',
  config: {
    validate: {
      payload: {
        index: Joi.string().optional(),
        type: Joi.string().optional()
      }
    },
  },
  async handler(request, h) {
    const server = request.server;
    const settings = server.settings.app;

    if (!server.search) {
      throw Boom.serverUnavailable('No connection to elasticsearch.');
    }

    const data = Object.assign({}, {
      index: settings.search.mainIndex,
      type: settings.search.defaultType,
      conflicts: 'proceed',
      refresh: true,
      body: {
        query: {
          match_all: {}
        }
      }
    }, request.payload);

    server.log(['remove', 'pending', 'info'], data);

    const { result, status } = await server.search.deleteByQuery(data);
    const remove = { result, status, data };
    if (status === 200) {
      server.log(['remove', 'success', 'info'], { type: data.type });
    } else {
      server.log(['remove', 'failed', 'error'], remove);
      throw Boom.badRequest('Error removing from index', remove);
    }
    return remove;
  }
};
