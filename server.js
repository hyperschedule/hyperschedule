#!/usr/bin/env node

/* eslint-disable no-console */

const express = require("express");
const process = require("process");

const server = express();

server.use(express.static("public"));
server.use((req, res) => {
  console.error("Page not found: " + req.url);
  res.status(404).send("Not found");
});
server.use((err, req, res) => {
  console.error("Internal server error");
  console.error(err);
  res.status(500).send("Internal server error");
});

const port = process.env.PORT || 5000;
server.listen(port);
console.log(
  `Hyperschedule webapp (dev server) listening on port ${port}`,
);
