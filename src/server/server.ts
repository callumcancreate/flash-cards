import express from "express";

const server = express();

server.use((req, res) => res.send("Hello world!"));

export default server;
