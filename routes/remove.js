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
  handler: {
    autoInject: {
      remove(server, settings, request, done) {
        if (!server.search) {
          return done(Boom.serverUnavailable('No connection to elasticsearch.'));
        }

        const data = Object.assign({}, request.payload, {
          index: settings.search.mainIndex,
          type: settings.search.defaultType,
          body: {
            query: {
              match_all: {}
            }
          }
        });

        server.log(['remove', 'pending', 'info'], data);

        server.search.deleteByQuery(data, (err, res, status) => {
          done(err, { res, status, data });
        });
      },
      reply(server, remove, done) {
        if (remove.status === 200) {
          server.log(['remove', 'success', 'info'], { type: remove.data.type });
        } else {
          server.log(['remove', 'failed', 'error'], remove);
          return done(Boom.badRequest('Error removing from index', remove));
        }

        done(null, remove);
      }
    }
  }
};
