import express from "express";
import {
  getSalesData,
} from "../controllers/dashboard-controller.js";

const router = express.Router();

router.get("/:year", getSalesData);

export default router;