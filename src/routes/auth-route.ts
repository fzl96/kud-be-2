import express from "express";
import {
  signIn,
  refreshToken,
  signOut,
} from "../controllers/auth-controller.js";

const router = express.Router();

router.get("/token", refreshToken);
router.post("/signin", signIn);
router.delete("/signout", signOut);

export default router;
