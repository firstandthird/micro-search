const Rapptor = require('rapptor');

//todo: add mock pagedata host

// todo: in future this will be changed to just use async/await
// everything else in the tests should be fine
module.exports.setup = (options, dataSet) => new Promise((resolve, reject) => {
  const testenv = {
    API_KEY: 'none',
    ELASTICSEARCH_HOST: 'http://localhost:9200',
    ELASTICSEARCH_INDEX: 'test' ,
    ELASTICSEARCH_TYPE: 'string' ,
    PAGEDATA_HOST: 'localhost:9000',
    PAGEDATA_KEY: 'test' ,
    PAGEDATA_SEARCH_OBJECT: '' ,
    PAGEDATA_STATUS: 'draft' ,
  };

  const allEnv = Object.assign({}, testenv, options.testenv);
  Object.keys(allEnv).forEach(key => {
    process.env[key] = allEnv[key];
  });

  const rapptor = new Rapptor({});
  rapptor.start((err, result) => {
    if (err) {
      return reject(err);
    }
    // save references to current rapptor/server for use in inject/shutdown:
    module.exports.rapptor = rapptor;
    module.exports.rapptor.server = rapptor.server;
    const returnObj = { rapptor, server: rapptor.server };
    return resolve(returnObj);
  });
});

module.exports.stop = async () => new Promise((resolve, reject) => {
  module.exports.rapptor.stop((err) => {
    if (err) {
      return reject(err);
    }
    resolve();
  });
});
