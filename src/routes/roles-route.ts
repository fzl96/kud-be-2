import express from "express";
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  deleteRoles,
} from "../controllers/roles-controller";

const router = express.Router();

router.get("/", getRoles);
router.get("/:id", getRole);
router.post("/", createRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);
router.delete("/", deleteRoles);

export default router;
