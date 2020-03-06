import Joi from "@hapi/joi";
import { limit, offset } from "./Find";

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
  front: front.optional(),
  back: back.optional(),
  tags: tags.optional(),
  hint: hint.optional()
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
  limit,
  offset
});

export const CardSchema = Joi.object({
  cardId: cardId.optional(),
  front,
  back,
  tags,
  hint: hint.optional()
});
