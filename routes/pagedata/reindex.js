const Joi = require('joi');
const async = require('async');

exports.reindex = {
  method: 'POST',
  path: '/pagedata/reindex',
  config: {
    validate: {
      payload: {
        index: Joi.string().optional(),
        projectSlug: Joi.string().required(),
        type: Joi.array().items(Joi.string()).unique().optional().single().default([])
      }
    },
  },
  handler: {
    autoInject: {
      remove(server, request, done) {
        async.each(request.payload.type, (type, cb) => {
          server.req.delete(`/remove?token=${request.query.token}`, {
            payload: {
              index: request.payload.index,
              type
            }
          }, cb);
        }, done);
      },
      pages(remove, server, request, done) {
        server.methods.pagedata.projectSlug(request.payload.projectSlug, done);
      },
      index(pages, server, request, done) {
        if (!Array.isArray(pages)) {
          return done();
        }

        async.each(pages, (page, cb) => {
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
