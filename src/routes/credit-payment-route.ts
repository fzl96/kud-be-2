import express from "express";
import {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
} from "../controllers/credit-payment-controller.js";

const router = express.Router();

router.get("/", getPayments);
router.get("/:id", getPayment);
router.post("/", createPayment);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;
