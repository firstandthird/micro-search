const Rapptor = require('rapptor');

// todo: in future this will be changed to just use async/await
// everything else in the tests should be fine
module.exports.setup = (options, dataSet) => new Promise((resolve, reject) => {
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
