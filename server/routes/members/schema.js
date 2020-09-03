const Joi = require('@hapi/joi');

const payloadSchema = Joi.object({
  members: Joi.array().items(Joi.object({
    id: Joi.string().uuid().required(),
    organization: Joi.string().required()
  }).unknown())
});

module.exports = {
  payloadSchema: payloadSchema
}