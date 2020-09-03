const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');

const { payloadSchema } = require('./schema');

const register = async (server, options) => {

  server.route({
    method: 'GET',
    path: '/members/{id?}',
    options: {
      validate: {
        query: Joi.object({
          organization: Joi.string().optional()
        }),
        params: Joi.object({
          id: Joi.string().optional()
        }),
        failAction: async (request, h, err) => { throw err; }
      }
    },
    handler: async (request, h) => {
      const { client } = server.app;
      const organization = request.query.organization;
      const ids = request.params.id;
      const members = await client.members.get({ ids: ids, organization: organization });
      if (members) {
        return {
          members: members
        };
      }
      return Boom.notFound();
    }
  });

  server.route({
    method: 'POST',
    path: '/members',
    options: {
      validate: {
        payload: payloadSchema,
        failAction: async (request, h, err) => { throw err; }
      }
    },
    handler: async (request, h) => {
      const { client } = server.app;
      const values = await client.members.store(request.payload.members);
      return {
        members: values.map(d => d.value)
      };
    }
  });
};

module.exports = {
  register: register
}