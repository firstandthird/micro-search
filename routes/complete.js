const Joi = require('joi');
const Boom = require('boom');

exports.query = {
  method: 'GET',
  path: '/complete',
  config: {
    validate: {
      query: {
        index: Joi.string().optional(),
        field: Joi.string().required(),
        q: Joi.string().required(),
        token: Joi.string()
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
    }, {
      index: request.query.index,
      body: {
        suggest: {
          suggestion: {
            completion: {
              field: `${request.query.field}_suggest`,
              fuzzy: {
                fuzziness: 2
              }
            }
          },
          text: request.query.q
        }
      }
    });

    server.log(['complete', 'pending', 'info'], data);

    const { result, status } = await server.search.search(data);
    const query = { result, status, data };
    if (status === 200) {
      server.log(['complete', 'success', 'info'], { query: query.data });
    } else {
      server.log(['complete', 'failed', 'error'], query);
      throw Boom.badRequest('Error executing query', query);
    }

    // Makes sure suggest.suggestion exists
    const res = Object.assign({}, { suggest: { suggestion: [] } }, query.result);

    return res.suggest.suggestion;
  }
};
