import express from "express";
import {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMembers,
  deleteMember,
} from "../controllers/members-controller.js";

const router = express.Router();

router.get("/", getMembers);
router.get("/:id", getMember);
router.post("/", createMember);
router.put("/:id", updateMember);
router.delete("/:id", deleteMember);
router.delete("/", deleteMembers);

export default router;
