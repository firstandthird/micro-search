const Rapptor = require('rapptor');

//todo: add mock pagedata host

// todo: in future this will be changed to just use async/await
// everything else in the tests should be fine
module.exports.setup = (options, mapping) => new Promise((resolve, reject) => {
  if (!options) {
    options = {};
  }
  const testenv = {
    API_KEY: 'test',
    ELASTICSEARCH_HOST: 'elasticsearch:9200',
    ELASTICSEARCH_INDEX: 'test_index' ,
    ELASTICSEARCH_TYPE: 'string' ,
    PAGEDATA_HOST: 'http://localhost:8080', // just use local server for testing pagedata
    PAGEDATA_KEY: 'test' ,
    PAGEDATA_SEARCH_OBJECT: 'searchObject' ,
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

    // clear out the test index before beginning:
    rapptor.server.search.indices.delete({
      index: '*',
    }, (err2, res) => {
      const returnObj = { rapptor, server: rapptor.server };
      // add any mock mapping:
      if (mapping) {
        return rapptor.server.search.indices.putMapping(mapping, (mappingErr, mappingRes) => resolve(returnObj));
      }
      return resolve(returnObj);
    });

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
