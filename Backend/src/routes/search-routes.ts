import express from "express";
import * as searchControllers from "../controllers/search-controllers";

const router = express.Router();

router.get("/", searchControllers.searchAll);

export default router;
