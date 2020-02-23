import * as c from "../controllers/categories";
import express from "express";
import validateBody from "../middleware/validateBody";
import { PatchCategorySchema } from "../Schemas/Category";
const router = express.Router();

router.get("/:id", c.getCategory);
router.get("/", c.getCategories);
router.patch("/:id", validateBody(PatchCategorySchema), c.updateCategory);
router.delete("/:id", c.deleteCategory);

export default router;
