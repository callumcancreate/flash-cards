import Joi from "@hapi/joi";
import { TagSchema } from "./Tag";
import { limit, offset } from "./Find";

const categoryId = Joi.number().label("Category ID");
const parentId = Joi.number()
  .allow(null)
  .label("Parent ID");
const name = Joi.string().label("Name");
const tags = Joi.array()
  .label("Tags")
  .items(TagSchema);

const children = Joi.array()
  .label("Children")
  .items(Joi.object());

export const CategoryFindOptions = Joi.object({
  limit,
  offset
});

export const PatchCategorySchema = Joi.object({
  parentId: parentId.optional(),
  name: name.optional(),
  tags: tags.optional()
});

export const DeleteCardSchema = Joi.object({
  categoryId: categoryId.required()
});

export const CategorySchema = Joi.object({
  categoryId: categoryId.optional(),
  parentId: parentId.optional(),
  children: children.optional(),
  name,
  tags
});
