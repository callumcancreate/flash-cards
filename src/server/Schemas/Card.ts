import Joi from "@hapi/joi";

export const DeleteCardSchema = Joi.object({
  categoryId: Joi.number()
    .label("Category ID")
    .required(),
  cardId: Joi.number()
    .label("Card ID")
    .required()
});

export const PatchCardSchema = Joi.object({
  front: Joi.string().label("Front"),
  back: Joi.string().label("Back"),
  hint: Joi.string()
    .label("Hint")
    .optional()
});

export const CardSchema = Joi.object({
  cardId: Joi.number().optional(),
  categoryId: Joi.number()
}).concat(PatchCardSchema);
