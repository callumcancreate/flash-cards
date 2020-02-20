import express from "express";
import apiRouter from "./routes/api";

const server = express();

server.use("/api/v1", apiRouter);
server.use("*", (req, res) => res.status(404).send());
export default server;
