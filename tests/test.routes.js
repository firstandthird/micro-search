const tap = require('tap');
const setup = require('./setup.js');

tap.test('can intitialize instance', async t => {
  const { rapptor, server } = await setup.setup();
  t.ok(server.methods.flatten, 'loads flatten method');
  t.ok(server.methods.pagedata, 'loads pagedata methods');
  const table = server.table()[0].table;
  const paths = table.map(route => route.path);
  t.match(paths, ['/add', '/query', '/pagedata/hook', '/pagedata/reindex', '/complete', '/remove', '/remove/single']);
  await setup.stop();
  t.end();
});


tap.test('route.add', async t => {
  const { rapptor, server } = await setup.setup();
  const response = await server.inject({
    method: 'post',
    url: '/add',
    payload: {
      index: 'index1',
      type: 'string',
      id: 'theId',
      body: {
        something: 'else'
      }
    }
  });
  await setup.stop();
  t.end();
});
