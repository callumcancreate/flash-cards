import Joi from "@hapi/joi";

const cardId = Joi.number().label("Card ID");
const front = Joi.string().label("Front");
const back = Joi.string().label("Back");
const tags = Joi.array()
  .label("Tags")
  .items(Joi.string());
const hint = Joi.string().label("Hint");

export const DeleteCardSchema = Joi.object({
  cardId: cardId.required()
});

export const PatchCardSchema = Joi.object({
  front,
  back,
  tags,
  hint
});

export const CardFindFilter = Joi.object({
  cardId,
  front,
  back,
  hint
});

export const CardFindOptions = Joi.object({
  tagsAll: Joi.array().items(Joi.string()),
  tagsNone: Joi.array().items(Joi.string()),
  limit: Joi.number().min(0),
  offset: Joi.number().min(0)
});

export const CardSchema = Joi.object({
  cardId,
  front,
  back,
  tags,
  hint: hint.optional()
});
