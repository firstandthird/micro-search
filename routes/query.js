const Joi = require('joi');
const Boom = require('boom');

exports.query = {
  method: 'POST',
  path: '/query',
  config: {
    validate: {
      payload: {
        index: Joi.string().optional(),
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
      ignoreUnavailable: true
    }, request.payload);

    server.log(['query', 'pending', 'info'], data);

    const { result, status } = await server.search.search(data);
    const query = { result, status, data };
    if (query.status === 200) {
      server.log(['query', 'success', 'info'], { query: query.data });
    } else {
      server.log(['query', 'failed', 'error'], query);
      throw Boom.badRequest('Error executing query', query);
    }

    // Makes sure hits.hits exists
    const res = Object.assign({}, { hits: { total: 0, hits: [] } }, query.result);

    return res.hits;
  }
};
