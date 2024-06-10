import Joi from 'joi';

const productRequestInputSchema = Joi.object({
  productName: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  make: Joi.string().required(),
  model: Joi.string().required(),
  description: Joi.string().required(),
  year: Joi.string().required(),
  countryOfOrigin: Joi.string(),
  condition: Joi.string().required(),
});

const editRequestInputSchema = Joi.object({
  id: Joi.string().required(),
  productName: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  make: Joi.string().required(),
  model: Joi.string().required(),
  description: Joi.string().required(),
  year: Joi.string().required(),
  countryOfOrigin: Joi.string(),
  condition: Joi.string().required(),
});

// Validation functions
const validateProductRequestInput = (input:any) => {
  return productRequestInputSchema.validate(input);
};

const validateEditRequestInput = (input:any) => {
  return editRequestInputSchema.validate(input);
};

export {
  validateProductRequestInput,
  validateEditRequestInput,
};
