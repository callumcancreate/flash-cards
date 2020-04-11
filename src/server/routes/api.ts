import express from "express";
import cardRouter from "./cards";
import categoryRouter from "./categories";
import userRouter from "./users";

const router = express.Router();

router.use("/cards", cardRouter);
router.use("/categories", categoryRouter);
router.use("/users", userRouter);
router.use("*", (req, res) => {
  res.status(400).send({ error: "Not a valid endpoint" });
});

export default router;
