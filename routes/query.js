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
  handler: {
    autoInject: {
      query(server, settings, request, done) {
        if (!server.search) {
          return done(Boom.serverUnavailable('No connection to elasticsearch.'));
        }

        const data = Object.assign({}, request.payload, {
          index: settings.search.mainIndex
        });

        server.log(['query', 'pending', 'info'], data);

        server.search.search(data, (err, res, status) => {
          done(err, { res, status, data });
        });
      },
      reply(server, query, done) {
        if (query.status === 200) {
          server.log(['query', 'success', 'info'], { query: query.data });
        } else {
          server.log(['query', 'failed', 'error'], query);
          return done(Boom.badRequest('Error executing query', query));
        }

        // Makes sure hits.hits exists
        const res = Object.assign({}, query.res, { hits: { hits: [] } });

        done(null, res.hits.hits);
      }
    }
  }
};
