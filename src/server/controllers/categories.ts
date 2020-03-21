import { asyncCatchWrapper } from "../../utils";
import Category from "../models/Category";
import Card from "../models/Card";
import NamedError from "../models/NamedError";

export const createCategory = asyncCatchWrapper(async (req, res) => {
  const category = new Category(req.body);
  await category.save();
  res.status(201).send({ category });
});

export const getCategory = asyncCatchWrapper(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  res.send({ category });
});

export const getCategories = asyncCatchWrapper(async (req, res) => {
  const categories = await Category.find({});
  res.send({ categories });
});

export const getCategoryCards = asyncCatchWrapper(async (req, res, next) => {
  const category = await Category.findById(req.params.categoryId);
  req.query.tagsAll = category.tags;
  next();
});

export const updateCategory = asyncCatchWrapper(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category)
    throw new NamedError(
      "NotFound",
      `Unable to find category with id ${req.params.categoryId}`
    );
  for (let key in req.body) {
    category[key] = req.body[key];
  }
  await category.save();
  return res.send({ category });
});

export const deleteCategory = asyncCatchWrapper(async (req, res) => {
  const { withChildren } = req.query;
  const count = withChildren
    ? await Category.deleteById(req.params.categoryId)
    : await Category.unlinkAndDeleteById(req.params.categoryId);

  if (!count)
    throw new NamedError(
      "NotFound",
      `Unable to find category with id ${req.params.categoryId}`
    );
  return res.send({ count });
});
