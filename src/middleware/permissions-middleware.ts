import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../utils/requestType.js";

type RequiredRoles = {
  route: string;
  roles: string[];
}

const requiredRoles: RequiredRoles[] = [
  {
    route: "/dashboard",
    roles: ["Admin", "Kasir", "Bendahara", "Ketua"],
  },
  {
    route: "/categories",
    roles: ["Admin", "Kasir"],
  },
  {
    route: "/suppliers",
    roles: ["Admin", "Kasir", "Bendahara"],
  },
  {
    route: "/products",
    roles: ["Admin", "Kasir", "Bendahara"],
  },
  {
    route: "/export/products",
    roles: ["Admin", "Kasir", "Bendahara"],
  },
  {
    route: "/sales",
    roles: ["Admin", "Kasir"],
  },
  {
    route: "/credit-payment",
    roles: ["Admin", "Kasir"],
  },
  {
    route: "/purchases",
    roles: ["Admin", "Kasir", "Bendahara"],
  },
  {
    route: "/cashier",
    roles: ["Admin", "Kasir"],
  },
  {
    route: "/users",
    roles: ["Admin", "Kasir"],
  },
  {
    route: "/groups",
    roles: ["Admin"],
  },
  {
    route: "/members",
    roles: ["Admin", "Kasir"],
  },
  
]

export const authorize = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { user } = req;
  const { role } = user;

  const route = req.baseUrl;

  const hasRequiredRole = requiredRoles.find((item) => item.route === route)?.roles.includes(role.name);
  

  if (!hasRequiredRole) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  next();
}