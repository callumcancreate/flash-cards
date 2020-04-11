import * as c from "../controllers/users";
import express from "express";
const router = express.Router();

router.post("/login", c.login);

export default router;
