const Boom = require('boom');

exports.pagedataHook = {
  method: 'POST',
  path: '/pagedata/hook',
  async handler(request, h) {
    const server = request.server;
    const settings = server.settings.app;

    if (!request.payload || !request.payload.slug) {
      throw Boom.badData('slug required');
    }

    // Allow setting of draft to also pull publish, but not the other way around
    if (settings.search.status === 'published' && request.payload.status !== settings.search.status) {
      server.log(['pagedata', 'skipped', 'info'], { slug: request.payload.slug, status: request.payload.status });
      return false;
    }

    const content = await server.methods.pagedata.getPageContent(request.payload.slug);

    let searchObject = content;
    if (typeof content[settings.search.searchObject] === 'object') {
      searchObject = content[settings.search.searchObject];
      delete content[settings.search.searchObject];
    } else {
      delete content.id;
      delete content.type;
    }

    const data = {
      id: searchObject.id,
      type: searchObject.type,
      body: content
    };

    // Allows entire pagedata object
    if (settings.search.indexAll && settings.search.indexAllKey) {
      data.body[settings.search.indexAllKey] = server.methods.flatten(content);
    }
    const index = await server.req.post(`/add?token=${request.query.token}`, { payload: data });
    server.log(['pagedata', 'success', 'info'], { slug: request.payload.slug });
    return index;
  }
};
