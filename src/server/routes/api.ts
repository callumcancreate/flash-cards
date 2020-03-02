import express from "express";
import categoryRouter from "./cards";

const router = express.Router();

router.use("/cards", categoryRouter);
router.use("*", (req, res) => {
  res.status(400).send({ error: "Not a valid endpoint" });
});

export default router;
