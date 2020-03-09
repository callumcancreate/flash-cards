import Joi from "@hapi/joi";
import { limit, offset } from "./Find";

const tagId = Joi.number().label("Tag ID");
const tag = Joi.string().label("Tag");
const isInherited = Joi.boolean().optional();

export const TagFindOptions = Joi.object({
  limit,
  offset
});

export const TagSchema = Joi.object({
  tagId: tagId.optional(),
  tag,
  isInherited
});
