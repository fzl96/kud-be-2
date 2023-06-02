import express from "express";
import {
  getPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchases,
} from "../controllers/purchases-controller";

const router = express.Router();

router.get("/", getPurchases);
router.get("/:id", getPurchase);
router.post("/", createPurchase);
router.put("/:id", updatePurchase);
router.delete("/", deletePurchases);

export default router;
