import express from "express";
import cardRouter from "./cards";
import tagRouter from "./tags";
import categoryRouter from "./categories";

const router = express.Router();

router.use("/cards", cardRouter);
router.use("/tags", tagRouter);
router.use("/categories", categoryRouter);
router.use("*", (req, res) => {
  res.status(400).send({ error: "Not a valid endpoint" });
});

export default router;
