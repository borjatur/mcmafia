const { MongoClient } = require('mongodb');

const Collection = require('./collection');

async function create({ url, database }) {

  const client = new MongoClient(url);
  await client.connect();

  return {
    members: new Collection('members', client.db(database))
  }
}

module.exports = {
  create: create
};