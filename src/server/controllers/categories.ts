import Category from "../models/Category";
import { asyncCatchWrapper } from "../../utils";

export const createCategory = asyncCatchWrapper(async (req, res) => {
  const category = new Category(req.body);
  await category.save();
  res.send({ category });
});

export const getCategory = asyncCatchWrapper(async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findById(categoryId);
  return res.send({ category });
});

export const getCategories = asyncCatchWrapper(async (req, res) => {
  const categories = await Category.find();
  return res.send({ categories });
});

export const updateCategory = asyncCatchWrapper(async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findById(categoryId);
  for (let key in req.body) {
    category[key] = req.body[key];
  }
  await category.save();
  return res.send({ category });
});

export const deleteCategory = asyncCatchWrapper(async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findById(categoryId);
  const count = await category.delete();
  return res.send({ count });
});
