import express from "express";

const router = express.Router();

router.use("*", (req, res) => {
  res.status(400).send({ error: "Not a valid endpoint" });
});

export default router;
