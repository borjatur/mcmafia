'use strict';

const Hapi = require('@hapi/hapi');

const { port, mongoUri, database } = require('../config');
const Routes = require('./routes');
const Dao = require('./app/dao');

const create = async () => {

  const server = Hapi.server({
    port: port,
    routes: {
      json: {
        space: 2
      }
    }
  });

  await server.register({ plugin: Routes });
  const client = await Dao.create({ url: mongoUri, database: database });

  server.app.client = client;
  return server;
};

module.exports = {
  create: create
};