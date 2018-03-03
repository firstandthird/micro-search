const elasticsearch = require('elasticsearch');

const register = function(server, options) {
  let client = null;
  if (options.host) {
    client = new elasticsearch.Client({
      host: options.host,
      log: options.elasticLog,
      apiVersion: '6.0'
    });
  }

  server.decorate('server', 'search', client);

  if (typeof server.methods.postInit === 'function') {
    server.methods.postInit(client);
  }
};

exports.plugin = {
  register,
  name: 'search',
  pkg: require('../package.json')
};
