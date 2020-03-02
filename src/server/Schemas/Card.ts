import Joi from "@hapi/joi";

export const DeleteCardSchema = Joi.object({
  cardId: Joi.number()
    .label("Card ID")
    .required()
});

export const PatchCardSchema = Joi.object({
  front: Joi.string().label("Front"),
  back: Joi.string().label("Back"),
  tags: Joi.array()
    .label("Tags")
    .items(Joi.string()),
  hint: Joi.string()
    .label("Hint")
    .optional()
});

export const CardSchema = Joi.object({
  cardId: Joi.number().optional()
}).concat(PatchCardSchema);
