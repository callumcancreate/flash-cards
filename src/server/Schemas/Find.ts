import Joi from "@hapi/joi";

export const limit = Joi.number()
  .min(0)
  .optional();

export const offset = Joi.number()
  .min(0)
  .optional();

// export const sort =
