import * as c from "../controllers/cards";
import express from "express";
import validateBody from "../middleware/validateBody";
import { PatchCardSchema } from "../Schemas/Card";
const router = express.Router();

router.post("/", c.createCard);
router.get("/:cardId", c.getCard);
router.get("/", c.getCards);
router.patch("/:cardId", validateBody(PatchCardSchema), c.updateCard);
router.delete("/:cardId", c.deleteCard);

export default router;
