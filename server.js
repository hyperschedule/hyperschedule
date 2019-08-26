#!/usr/bin/env node

const express = require("express");
const process = require("process");

const server = express();

server.use(express.static("out"));
server.use((req, res, next) => {
  console.error("Page not found: " + req.url);
  res.status(404).send("Not found");
});
server.use((err, req, res, next) => {
  console.error("Internal server error");
  console.error(err);
  res.status(500).send("Internal server error");
});

const port = process.env.PORT || 5000;
server.listen(port);
console.log(
  `Hyperschedule webapp (dev server) listening on http://localhost:${port}`
);
