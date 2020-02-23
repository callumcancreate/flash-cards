import Joi from "@hapi/joi";

export const CardSchema = Joi.object({
  id: Joi.number().optional(),
  categoryId: Joi.number(),
  front: Joi.string().label("Front"),
  back: Joi.string().label("Back"),
  hint: Joi.string()
    .label("Hint")
    .optional()
});
