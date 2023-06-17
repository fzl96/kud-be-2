import express from "express";
import { getCategories } from "../controllers/categories-drizzle-controller.js";

const router = express.Router();

router.get("/", getCategories);

export default router;
