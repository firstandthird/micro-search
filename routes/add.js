const Joi = require('joi');
const Boom = require('boom');

exports.add = {
  method: 'POST',
  path: '/add',
  config: {
    validate: {
      payload: {
        index: Joi.string().optional(),
        type: Joi.string().optional(),
        id: Joi.string().required(),
        body: Joi.object().required()
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
      refresh: true
    }, request.payload);

    server.log(['add', 'pending', 'info'], data);

    const index = await server.search.index(data);

    if (Array.isArray(index) && typeof index[0] === 'object' && index[1] === 201) {
      server.log(['add', 'success', 'info'], { id: index[0]._id });
    } else {
      server.log(['add', 'failed', 'error'], index);
      throw Boom.badRequest('Error adding to index', index);
    }
  }
};
