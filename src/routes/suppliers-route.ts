import express from "express";
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  deleteSuppliers,
} from "../controllers/suppliers-controller";

const router = express.Router();

router.get("/", getSuppliers);
router.get("/:id", getSupplier);
router.post("/", createSupplier);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);
router.delete("/", deleteSuppliers);

export default router;
