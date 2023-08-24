import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../utils/requestType.js";
import jwt from "jsonwebtoken";

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
    if (err) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    req.user = user;
    next();
  });
};
