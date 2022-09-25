import express from "express";
import { router } from "./routes";

const server = express();
const PORT = 8080;

server.use("/api/v4", router);

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
