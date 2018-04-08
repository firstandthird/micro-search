const Boom = require('boom');

exports.pagedataHook = {
  method: 'POST',
  path: '/pagedata/hook',
  handler: {
    autoInject: {
      content(server, request, settings, done) {
        if (!request.payload || !request.payload.slug) {
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
        if (typeof content[settings.search.searchObject] === 'object') {
          searchObject = content[settings.search.searchObject];
          delete content[settings.search.searchObject];
        } else {
          delete content.id;
          delete content.type;
        }

        content.contentType = searchObject.type;

        const data = {
          id: searchObject.id,
          body: content
        };

        // Allows entire pagedata object
        if (settings.search.indexAll && settings.search.indexAllKey) {
          data.body[settings.search.indexAllKey] = server.methods.flatten(content);
        }

        server.req.post(`/add?token=${request.query.token}`, { payload: data }, done);
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
