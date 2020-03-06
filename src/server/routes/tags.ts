import * as c from "../controllers/tags";
import express from "express";
const router = express.Router();

router.get("/", c.getTags);

export default router;
