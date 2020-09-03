const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');

const Organization = require('../../app/model/Organization');

const register = async (server, options) => {
  server.route({
    method: 'GET',
    path: '/subordinates/{id}',
    options: {
      validate: {
        query: false,
        params: Joi.object({
          id: Joi.string().required()
        }),
        failAction: async (request, h, err) => { throw err; }
      }
    },
    handler: async (request, h) => {
      const { result: { members } } = await request.server.inject({
        url: `/members/${request.params.id}`
      });
      const member = members[0];
      if (!member) {
        return Boom.notFound();
      }
      try {
        const { result: { members } } = await request.server.inject({
          url: `/members?organization=${member.organization}`
        });
        const organization = new Organization(members);
        return organization.getNumberOfSubordinates(member.id);
      } catch (err) {
        //TODO http error mapping
        console.log('err', err);
        return Boom.notFound();
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/imprision',
    options: {
      validate: {
        query: false,
        payload: Joi.object({
          id: Joi.string().required()
        }),
        failAction: async (request, h, err) => { throw err; }
      }
    },
    handler: async (request, h) => {
      const { result: { members } } = await request.server.inject({
        url: `/members/${request.payload.id}`
      });
      const member = members[0];
      if (!member) {
        return Boom.notFound();
      }
      try {
        const { result: { members } } = await request.server.inject({
          url: `/members?organization=${member.organization}`
        });
        const organization = new Organization(members);
        organization.imprision(request.payload.id);
        const updatedListOfMembers = organization.getOrganizationList();
        const { result: { members: updatedMembers } } = await request.server.inject({
          method: 'POST',
          url: '/members',
          payload: {
            members: updatedListOfMembers
          }
        });
        return {
          members: updatedMembers
        }
      } catch (err) {
        //TODO http error mapping
        console.log('err', err);
        return Boom.notFound();
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/release',
    options: {
      validate: {
        query: false,
        payload: Joi.object({
          id: Joi.string().required()
        }),
        failAction: async (request, h, err) => { throw err; }
      }
    },
    handler: async (request, h) => {
      const { result: { members } } = await request.server.inject({
        url: `/members/${request.payload.id}`
      });
      const member = members[0];
      if (!member) {
        return Boom.notFound();
      }
      try {
        const { result: { members } } = await request.server.inject({
          url: `/members?organization=${member.organization}`
        });
        const organization = new Organization(members);
        organization.release(request.payload.id);
        const updatedListOfMembers = organization.getOrganizationList();
        const { result: { members: updatedMembers } } = await request.server.inject({
          method: 'POST',
          url: '/members',
          payload: {
            members: updatedListOfMembers
          }
        });
        return {
          members: updatedMembers
        }
      } catch (err) {
        console.log('err', err);
        //TODO http error mapping
        return Boom.notFound();
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/ranking/{ids}',
    options: {
      validate: {
        query: false,
        params: Joi.object({
          ids: Joi.string().required()
        }),
        failAction: async (request, h, err) => { throw err; }
      }
    },
    handler: async (request, h) => {
      const [id1, id2] = request.params.ids.split(',');
      const { result: { members: [member1] } } = await request.server.inject({
        url: `/members/${id1}`
      });
      const { result: { members: [member2] } } = await request.server.inject({
        url: `/members/${id2}`
      });
      if (!member1 || !member2 || member1.organization !== member2.organization) {
        return Boom.notFound();
      }
      try {
        const { result: { members } } = await request.server.inject({
          url: `/members?organization=${member1.organization}`
        });
        const organization = new Organization(members);
        const member1Level = organization.getMemberLevel(member1.id);
        const member2Level = organization.getMemberLevel(member2.id);
        if (member1Level !== member2Level) {
          const member = member2Level > member1Level ? member2 : member1;
          return { members: [member] };
        }
        const member1Subordinates = organization.getNumberOfSubordinates(member1.id);
        const member2Subordinates = organization.getNumberOfSubordinates(member2.id);
        if (member1Subordinates !== member2Subordinates) {
          const member = member2Subordinates > member1Subordinates ? member2 : member1;
          return { members: [member] };
        }
        return { members: [member1, member2] };
      } catch (err) {
        return Boom.notFound();
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/draw',
    options: {
      validate: {
        query: false,
        failAction: async (request, h, err) => { throw err; }
      }
    },
    handler: async (request, h) => {
      try {
        const organization = new Organization(request.payload.members);
        return organization.activeMembers.toString();
      } catch (err) {
        console.log('err', err);
        return Boom.serverUnavailable();
      }
    }
  });
};

module.exports = {
  register: register
}