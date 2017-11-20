const Boom = require('boom');

exports.pagedataHook = {
  method: 'POST',
  path: 'hook',
  handler: {
    autoInject: {
      content(server, request, settings, done) {
        if (!request.payload.slug) {
          return done(Boom.badData('slug required'));
        }

        // Allow setting of draft to also pull publish, but not the other way around
        if (settings.search.status === 'published' && request.payload.status !== settings.search.status) {
          server.log(['pagedata', 'skipped', 'info'], { slug: request.payload.slug, status: request.payload.status });
          return done(null, false);
        }

        server.methods.pagedata.getPageContent(request.payload.slug, done);
      },
      index(content, server, request, settings, done) {
        if (!content) {
          return done(null, false);
        }

        let searchObject = content;
        if (typeof content[settings.search.searchObject] !== 'object') {
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

        server.methods.req.post(`/add?token=${request.query.token}`, data, done);
      },
      reply(server, request, index, done) {
        if (!index) {
          return done();
        }

        server.log(['pagedata', 'success', 'info'], { slug: request.payload.slug });

        done(null, index);
      }
    }
  }
};
