const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  // Karena username menggunakan type data VARCHAR(50) di database,
  // kamu bisa gunakan fungsi max() untuk membatasi panjang maksimal dari string.
  username: Joi.string().max(50).required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});

module.exports = {
  UserPayloadSchema,
};
