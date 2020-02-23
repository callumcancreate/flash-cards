import Joi from "@hapi/joi";

export const CategorySchema = Joi.object({
  id: Joi.number().optional(),
  name: Joi.string().label("Name")
});
