const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const Sinon = require('Sinon');

const Server = require('../../server');
const Collection = require('../../server/app/dao/collection');

const { expect } = Code;
const { it, describe, before, after } = exports.lab = Lab.script();

describe('(Server)', () => {

  before(async ({ context }) => {
    context.getStub = Sinon.stub(Collection.prototype, 'get').returns(Promise.resolve([{ var: 'foo' }]));
    context.server = await Server.create();
  });

  after(({ context }) => {
    context.getStub.restore();
  });

  it('functional test sample using stubs', async ({ context: { server } }) => {
    const res = await server.inject({
      method: 'GET',
      url: '/members'
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.equal({
      members: [{
        var: 'foo'
      }]
    });

  });
});