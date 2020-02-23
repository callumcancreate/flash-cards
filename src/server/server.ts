import express from "express";
import bodyParser from "body-parser";
import apiRouter from "./routes/api";
import errorHandler from "./middleware/errorHandler";

const server = express();

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use("/api/v1", apiRouter);
server.use("*", (req, res) => res.status(404).send());
server.use(errorHandler);

export default server;
