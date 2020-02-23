import * as c from "../controllers/categories";
import express from "express";
import validateBody from "../middleware/validateBody";
import { PatchCategorySchema } from "../Schemas/Category";
import cardRouter from "./cards";

const router = express.Router();

router.use("/:categoryId/cards", cardRouter);
router.post("/", c.createCategory);
router.get("/:categoryId", c.getCategory);
router.get("/", c.getCategories);
router.patch(
  "/:categoryId",
  validateBody(PatchCategorySchema),
  c.updateCategory
);
router.delete("/:categoryId", c.deleteCategory);

export default router;
