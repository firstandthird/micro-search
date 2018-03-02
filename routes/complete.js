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
  handler: {
    autoInject: {
      query(server, settings, request, done) {
        if (!server.search) {
          return done(Boom.serverUnavailable('No connection to elasticsearch.'));
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

        server.search.search(data, (err, res, status) => {
          done(err, { res, status, data });
        });
      },
      reply(server, query, done) {
        if (query.status === 200) {
          server.log(['complete', 'success', 'info'], { query: query.data });
        } else {
          server.log(['complete', 'failed', 'error'], query);
          return done(Boom.badRequest('Error executing query', query));
        }

        // Makes sure suggest.suggestion exists
        const res = Object.assign({}, { suggest: { suggestion: [] } }, query.res);

        done(null, res.suggest.suggestion);
      }
    }
  }
};
