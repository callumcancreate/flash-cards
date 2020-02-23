import express from "express";
import bodyParser from "body-parser";
import apiRouter from "./routes/api";
import errorHandler from "./middleware/errorHandler";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router";
import React from "react";
import App from "../client/components/App";

const server = express();

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static("dist/public"));
server.use("/api/v1", apiRouter);
server.use(errorHandler);

server.get("*", (req, res) => {
  const context = {};
  const content = ReactDOMServer.renderToString(
    <StaticRouter location={req.url} context={context}>
      <App />
    </StaticRouter>
  );

  const html = `
<html>
  <head>
  </head>
  <body>
    <div id="#root">${content}</div>
    <script src="client.js"></script>
  </body>
</html
`;

  res.send(html);
});

export default server;
