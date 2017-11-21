const Joi = require('joi');
const async = require('async');

exports.reindex = {
  method: 'POST',
  path: '/pagedata/reindex',
  config: {
    validate: {
      payload: {
        index: Joi.string().optional(),
        collection: Joi.string().required(),
        type: Joi.array().items(Joi.string()).unique().optional().single().default([])
      }
    },
  },
  handler: {
    autoInject: {
      remove(server, request, done) {
        async.each(request.payload.type, (type, cb) => {
          server.req.post(`/remove?token=${request.query.token}`, {
            payload: {
              index: request.payload.index,
              type
            }
          }, cb);
        }, done);
      },
      collection(remove, server, request, done) {
        server.methods.pagedata.getCollectionPages(request.payload.collection, done);
      },
      index(collection, server, request, done) {
        if (!Array.isArray(collection)) {
          return done();
        }

        async.each(collection, (page, cb) => {
          server.req.post(`/pagedata/hook?token=${request.query.token}`, {
            payload: {
              slug: page.slug,
              status: page.status || 'published'
            }
          }, cb);
        }, done);
      },
      reply(server, index, done) {
        done(null, index);
      }
    }
  }
};
