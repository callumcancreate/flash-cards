import Joi from "@hapi/joi";
import { TagSchema } from "./Tag";
import { limit, offset } from "./Find";

const categoryId = Joi.number().label("Category ID");
const name = Joi.string().label("Name");
const tags = Joi.array()
  .label("Tags")
  .items(TagSchema);

export const CategoryFindOptions = Joi.object({
  limit,
  offset
});

export const PatchCategorySchema = Joi.object({
  name: name.optional(),
  tags: tags.optional()
});

export const DeleteCardSchema = Joi.object({
  categoryId: categoryId.required()
});

export const CategorySchema = Joi.object({
  categoryId: categoryId.optional(),
  name,
  tags
});
