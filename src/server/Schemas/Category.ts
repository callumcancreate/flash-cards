import Joi from "@hapi/joi";

export const PatchCategorySchema = Joi.object({
  name: Joi.string()
    .label("Name")
    .required()
});

export const CategorySchema = Joi.object({
  id: Joi.number().optional(),
  name: Joi.string().label("Name")
});
