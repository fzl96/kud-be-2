import express from "express";
import {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSales,
} from "../controllers/sales-controller.js";

const router = express.Router();

router.get("/", getSales);
router.get("/:id", getSale);
router.post("/", createSale);
router.put("/:id", updateSale);
router.delete("/", deleteSales);

export default router;
