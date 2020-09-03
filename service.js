'use strict';

const Server = require('./server');

const init = async () => {
  const server = await Server.create();
  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
