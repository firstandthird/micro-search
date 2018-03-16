const tap = require('tap');
const setup = require('./setup.js');

tap.test('can intitialize the server', async t => {
  const { rapptor, server } = await setup.setup({});
  t.ok(server.methods.flatten, 'loads flatten method');
  t.ok(server.methods.pagedata, 'loads pagedata methods');
  t.ok(server.search);
  const table = server.table()[0].table;
  const paths = table.map(route => route.path);
  t.match(paths, ['/add', '/query', '/pagedata/hook', '/pagedata/reindex', '/complete', '/remove', '/remove/single']);
  await setup.stop();
  t.end();
});

tap.test('route.add', async t => {
  const { rapptor, server } = await setup.setup({});
  const response = await server.inject({
    method: 'post',
    url: '/add?token=test',
    payload: {
      index: 'testindex',
      type: 'string',
      id: 'theId2',
      body: {
        title: 'Test 1',
        tags: ['y', 'z'],
        published: true
      }
    }
  });
  // returns the added item and code:
  t.equal(response.result.length, 2);
  t.match(response.result[0], {
    _index: 'testindex',
    _type: 'string',
    _id: 'theId2',
    result: 'created',
  });
  t.equal(response.result[1], 201);
  await setup.stop();
  t.end();
});

tap.test('route.query', async t => {
  const { rapptor, server } = await setup.setup({});
  await server.inject({
    method: 'post',
    url: '/add?token=test',
    payload: {
      index: 'testindex',
      type: 'string',
      id: 'theId1',
      body: {
        title: 'Test1',
        tags: ['y', 'z'],
        published: true
      }
    }
  });
  await server.inject({
    method: 'post',
    url: '/add?token=test',
    payload: {
      index: 'testindex',
      type: 'string',
      id: 'theId2',
      body: {
        title: 'Test2',
        tags: ['y', 'z'],
        published: true
      }
    }
  });
  const response = await server.inject({
    method: 'post',
    url: '/query?token=test',
    payload: {
      index: 'testindex',
      body: {
        query: {
          match: {
            title: 'Test2'
          }
        },
      }
    }
  });
  t.equal(response.result.total, 1, 'returns only the matching title');
  const response2 = await server.inject({
    method: 'post',
    url: '/query?token=test',
    payload: {
      index: 'testindex',
      body: {
        query: {
          match: {
            published: true
          }
        },
      }
    }
  });
  t.equal(response2.result.total, 2, 'returns both published results');
  await setup.stop();
  t.end();
});

tap.test('throws on invalid query', async t => {
  const { rapptor, server } = await setup.setup({});
  await server.inject({
    method: 'post',
    url: '/add?token=test',
    payload: {
      index: 'testindex',
      type: 'string',
      id: 'theId1',
      body: {
        title: 'Test1',
        tags: ['y', 'z'],
        published: true
      }
    }
  });
  const response = await server.inject({
    method: 'post',
    url: '/query?token=test',
    payload: {
      index: 'testindex',
      not: 'a thing you can do'
    }
  });
  t.equal(response.result.statusCode, 400);
  t.equal(response.result.message, 'child "body" fails because ["body" is required]');
  await setup.stop();
  t.end();
});

tap.test('route.remove', async t => {
  const { rapptor, server } = await setup.setup({});
  await server.inject({
    method: 'post',
    url: '/add?token=test',
    payload: {
      index: 'testindex',
      type: 'string',
      id: 'theId1',
      body: {
        title: 'Test1',
        tags: ['y', 'z'],
        published: true
      }
    }
  });
  await server.inject({
    method: 'post',
    url: '/add?token=test',
    payload: {
      index: 'testindex',
      type: 'string',
      id: 'theId2',
      body: {
        title: 'Test2',
        tags: ['a', 'z'],
        published: true
      }
    }
  });
  const deleteResponse = await server.inject({
    method: 'delete',
    url: '/remove?token=test',
    payload: {
      index: 'testindex',
      type: 'string'
    }
  });
  const queryResponse = await server.inject({
    method: 'post',
    url: '/query?token=test',
    payload: {
      index: 'testindex',
      body: {
        query: {
          match: {
            title: 'Test1'
          }
        },
      }
    }
  });
  t.equal(deleteResponse.result.res.total, 2, 'matching records were successfully removed');
  t.match(deleteResponse.result.data, {
    index: 'testindex',
    type: 'string',
    conflicts: 'proceed',
    refresh: true
  });
  await setup.stop();
  t.end();
});

tap.test('route.removeSingle', async t => {
  const { rapptor, server } = await setup.setup({});
  await server.inject({
    method: 'post',
    url: '/add?token=test',
    payload: {
      index: 'testindex',
      type: 'string',
      id: 'theId1',
      body: {
        title: 'Test1',
        tags: ['y', 'z'],
        published: true
      }
    }
  });
  const deleteResponse = await server.inject({
    method: 'delete',
    url: '/remove/single?token=test',
    payload: {
      index: 'testindex',
      type: 'string',
      id: 'theId1'
    }
  });
  t.match(deleteResponse.result.data, {
    index: 'testindex',
    type: 'string',
    id: 'theId1'
  });
  await setup.stop();
  t.end();
});

tap.test('route.pagedata/hook`', async t => {
  const { rapptor, server } = await setup.setup({});
  server.route({
    method: 'get',
    path: '/api/pages/page',
    handler(request, reply) {
      return reply({
        content: {
          searchObject: {
            index: 'testindex',
            type: 'string',
            id: 'theId2',
            body: {
              title: 'Test 1',
              tags: ['y', 'z'],
              published: true
            }
          }
        }
      });
    }
  });

  await setup.stop();
  t.end();
});

tap.test('route.pagedata/reindex`', async t => {
  const { rapptor, server } = await setup.setup({});
  server.route({
    method: 'get',
    path: '/api/pages/page',
    handler(request, reply) {
      return reply({
        content: {
          searchObject: {
            index: 'testindex',
            type: 'string',
            id: 'theId2',
            body: {
              title: 'Test 1',
              tags: ['y', 'z'],
              published: true
            }
          }
        }
      });
    }
  });
  server.route({
    method: 'get',
    path: '/api/projects/page',
    handler(request, reply) {
      return reply({
        content: {
          searchObject: {
            index: 'testindex',
            type: 'string',
            id: 'theId2',
            body: {
              title: 'Test 1',
              tags: ['y', 'z'],
              published: true
            }
          }
        }
      });
    }
  });
  const response = await server.inject({
    method: 'post',
    url: '/add?token=test',
    payload: {
      index: 'testindex',
      type: 'string',
      id: 'theId2',
      body: {
        title: 'Test 1',
        tags: ['y', 'z'],
        published: true
      }
    }
  });
  const response2 = await server.inject({
    method: 'post',
    url: '/pagedata/reindex?token=test',
    payload: {
      index: 'testindex',
      projectSlug: 'projectx',
      type: 'string'
    }
  });
  console.log('resutl');
  console.log(response.result);
  await setup.stop();
  t.end();
});
