import Category from "../models/Category";
import client from "../db";
import { asyncCatchWrapper } from "../../utils";

export const getCategory = asyncCatchWrapper(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  return res.send({ category });
});

export const getCategories = asyncCatchWrapper(async (req, res) => {
  const categories = await Category.find();
  return res.send({ categories });
});

export const updateCategory = asyncCatchWrapper(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  for (let key in req.body) {
    category[key] = req.body[key];
  }
  await category.save();
  return res.send({ category });
});

export const deleteCategory = asyncCatchWrapper(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  const rowCount = await category.delete();
  return res.send({ rowCount });
});
