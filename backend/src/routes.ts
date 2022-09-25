import express, { type Router } from "express";

export const router: Router = express.Router();
router.get("/", (req, res) => {
    res.send("hyperschedule v4");
});
