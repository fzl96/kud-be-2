import express from "express";
import {
  getGroups,
  getGroup,
  createGroup,
  deleteGroup,
  deleteGroups,
  updateGroup,
} from "../controllers/groups-controller";

const router = express.Router();

router.get("/", getGroups);
router.get("/:id", getGroup);
router.put("/:id", updateGroup);
router.post("/", createGroup);
router.delete("/:id", deleteGroup);
router.delete("/", deleteGroups);

export default router;
