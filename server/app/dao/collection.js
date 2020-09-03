// const uuidv1 = require('uuid/v1');
const _ = require('lodash');

class Collection {
  constructor(collection, client) {
    this.collection = collection;
    this.client = client;
  }

  async get({ ids, organization }) {
    let criteria = {};
    if (ids) {
      const arrayIds = Array.isArray(ids) ? ids : [ids];
      criteria._id = { $in: arrayIds };
    }
    if (organization) {
      criteria.organization = organization;
    }
    return this.client
      .collection(this.collection)
      .find(criteria)
      .toArray()
      .then(result => result.map((e) => {
        e.id = e._id;
        delete e._id;
        return e;
      }));
  }

  async store(docs) {
    const docsArray = _.isArray(docs) ? docs : [docs];
    return Promise.all(docsArray.map(doc => {
      const criteria = [
        { _id: doc.id },
        { $set: _.omit(doc, 'id') },
        { upsert: true, returnOriginal: false }
      ];
      return this.client
        .collection(this.collection)
        .findOneAndUpdate(...criteria)
        .then(({ lastErrorObject, value }) => {
          const { upserted, updatedExisting } = lastErrorObject;
          value.id = value._id;
          delete value._id;
          return {
            value: value,
            created: upserted ? true : false,
            updated: updatedExisting
          };
        });
    }));
  }
}

module.exports = Collection;
