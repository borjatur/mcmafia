const BusinessRoutes = require('./business');
const DataRoutes = require('./members');

exports.plugin = {
  name: 'routes',
  register: async (server, options) => {
    BusinessRoutes.register(server, options);
    DataRoutes.register(server, options);
  }
};