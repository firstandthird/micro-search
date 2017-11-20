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
  handler: {
    autoInject: {
      index(server, settings, request, done) {
        if (!server.search) {
          return done(Boom.serverUnavailable('No connection to elasticsearch.'));
        }

        const data = Object.assign({}, request.payload, {
          index: settings.search.mainIndex,
          type: settings.search.defaultType
        });

        server.log(['add', 'pending', 'info'], data);

        server.search.index(data, done);
      },
      reply(server, index, done) {
        if (Array.isArray(index) && typeof index[0] === 'object' && index[1] === 200) {
          server.log(['add', 'success', 'info'], { id: index[0]._id });
        } else {
          server.log(['add', 'failed', 'error'], index);
          return done(Boom.badRequest('Error adding to index', index));
        }

        done(null, index);
      }
    }
  }
};
