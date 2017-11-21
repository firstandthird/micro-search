const elasticsearch = require('elasticsearch');

exports.register = function(server, options, next) {
  let client = null;
  if (options.host) {
    client = new elasticsearch.Client({
      host: options.host,
      log: options.elasticLog,
      apiVersion: '5.0'
    });
  }

  server.decorate('server', 'search', client);
  next();
};

exports.register.attributes = {
  name: 'search'
};