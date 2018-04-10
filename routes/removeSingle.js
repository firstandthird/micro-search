const Joi = require('joi');
const Boom = require('boom');

exports.removeSingle = {
  method: 'DELETE',
  path: '/remove/single',
  config: {
    validate: {
      payload: {
        index: Joi.string().optional(),
        id: Joi.string().required()
      }
    },
  },
  handler: {
    autoInject: {
      remove(server, settings, request, done) {
        if (!server.search) {
          return done(Boom.serverUnavailable('No connection to elasticsearch.'));
        }

        const data = Object.assign({}, {
          index: settings.search.mainIndex,
          type: settings.search.defaultType
        }, request.payload);

        server.log(['remove', 'pending', 'info'], data);

        server.search.delete(data, (err, res, status) => {
          done(err, { res, status, data });
        });
      },
      reply(server, remove, done) {
        if (remove.status === 200) {
          server.log(['remove', 'success', 'info'], { id: remove.data.id });
        } else {
          server.log(['remove', 'failed', 'error'], remove);
          return done(Boom.badRequest('Error removing from index', remove));
        }

        done(null, remove);
      }
    }
  }
};
