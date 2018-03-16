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
  async handler(request, h) {
    const server = request.server;
    const removePromises = request.payload.type.map(type =>
      server.req.post(`/remove?token=${request.query.token}`, {
        payload: {
          index: request.payload.index,
          type
        }
      }));
    await Promise.all(removePromises);
    const pages = await server.methods.pagedata.projectSlug(request.payload.projectSlug);
    if (!Array.isArray(pages)) {
      return [];
    }
    const hookPromises = pages.map(page => server.req.post(`/pagedata/hook?token=${request.query.token}`, {
      payload: {
        slug: page.slug,
        status: page.status || 'published'
      }
    }));
    const index = await Promise.all(hookPromises);
    return index;
  }
};
