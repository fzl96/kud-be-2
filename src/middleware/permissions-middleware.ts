import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../utils/requestType.js";

const AdminPermissions = [
  "create_dashboard",
  "read_dashboard",
  "update_dashboard",
  "delete_dashboard",
  "create_categories",
  "read_categories",
  "update_categories",
  "delete_categories",
  "create_products",
  "read_products",
  "update_products",
  "delete_products",
  "create_suppliers",
  "read_suppliers",
  "update_suppliers",
  "delete_suppliers",
  "create_sales",
  "read_sales",
  "update_sales",
  "delete_sales",
  "create_customers",
  "read_customers",
  "update_customers",
  "delete_customers",
  "create_purchases",
  "read_purchases",
  "update_purchases",
  "delete_purchases",
  "create_users",
  "read_users",
  "update_users",
  "delete_users",
  "create_groups",
  "read_groups",
  "update_groups",
  "delete_groups",
];

const CashierPermissions = [
  "read_sales",
  "create_sales",
  "update_sales",
  "delete_sales",
  "read_customers",
  "create_customers",
  "update_customers",
  "delete_customers",
  "read_products",
  "read_groups",
  "create_groups",
  "update_groups",
  "delete_groups",
];

const BendaharaPermissions = [
  "read_purchases",
  "create_purchases",
  "update_purchases",
  "delete_purchases",
  "read_products",
  "read_suppliers",
  "create_suppliers",
  "update_suppliers",
  "delete_suppliers",
  "read_sales",
  "delete_sales",
];

const KetuaPermissions = ["read_dashboard"];

const permissions = [
  {
    role: "Admin",
    permissions: AdminPermissions,
  },
  {
    role: "Kasir",
    permissions: CashierPermissions,
  },
  {
    role: "Bendahara",
    permissions: BendaharaPermissions,
  },
  {
    role: "Ketua",
    permissions: KetuaPermissions,
  },
];

export const authorizeCategories = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let requiredPermission = "";
  const resourceName = "categories";

  switch (req.method) {
    case "GET":
      requiredPermission = `read_${resourceName}`;
      break;
    case "POST":
      requiredPermission = `create_${resourceName}`;
      break;
    case "PUT":
      requiredPermission = `update_${resourceName}`;
      break;
    case "DELETE":
      requiredPermission = `delete_${resourceName}`;
      break;
  }

  const userPermissions =
    permissions.find((permission) => permission.role === req.user.role.name)
      ?.permissions || [];

  if (!userPermissions.includes(requiredPermission)) {
    return res.status(403).json({ error: "Anda tidak memiliki akses." });
  }

  // If the user has the required permission, proceed to the next middleware or route handler
  next();
};

export const authorizeProducts = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let requiredPermission = "";
  const resourceName = "products";

  switch (req.method) {
    case "GET":
      requiredPermission = `read_${resourceName}`;
      break;
    case "POST":
      requiredPermission = `create_${resourceName}`;
      break;
    case "PUT":
      requiredPermission = `update_${resourceName}`;
      break;
    case "DELETE":
      requiredPermission = `delete_${resourceName}`;
      break;
  }
  const userPermissions =
    permissions.find((permission) => permission.role === req.user.role.name)
      ?.permissions || [];

  if (!userPermissions.includes(requiredPermission)) {
    return res.status(403).json({ error: "Anda tidak memiliki akses." });
  }

  // If the user has the required permission, proceed to the next middleware or route handler
  next();
};

export const authorizeUsers = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let requiredPermission = "";
  const resourceName = "users";

  switch (req.method) {
    case "GET":
      requiredPermission = `read_${resourceName}`;
      break;
    case "POST":
      requiredPermission = `create_${resourceName}`;
      break;
    case "PUT":
      requiredPermission = `update_${resourceName}`;
      break;
    case "DELETE":
      requiredPermission = `delete_${resourceName}`;
      break;
  }

  const userPermissions =
    permissions.find((permission) => permission.role === req.user.role.name)
      ?.permissions || [];

  if (!userPermissions.includes(requiredPermission)) {
    return res.status(403).json({ error: "Anda tidak memiliki akses." });
  }

  // If the user has the required permission, proceed to the next middleware or route handler
  next();
};

export const authorizeRoles = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let requiredPermission = "";
  const resourceName = "roles";

  switch (req.method) {
    case "GET":
      requiredPermission = `read_${resourceName}`;
      break;
    case "POST":
      requiredPermission = `create_${resourceName}`;
      break;
    case "PUT":
      requiredPermission = `update_${resourceName}`;
      break;
    case "DELETE":
      requiredPermission = `delete_${resourceName}`;
      break;
  }

  const userPermissions =
    permissions.find((permission) => permission.role === req.user.role.name)
      ?.permissions || [];

  if (!userPermissions.includes(requiredPermission)) {
    return res.status(403).json({ error: "Anda tidak memiliki akses." });
  }

  // If the user has the required permission, proceed to the next middleware or route handler
  next();
};

export const authorizeSales = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let requiredPermission = "";
  const resourceName = "sales";

  switch (req.method) {
    case "GET":
      requiredPermission = `read_${resourceName}`;
      break;
    case "POST":
      requiredPermission = `create_${resourceName}`;
      break;
    case "PUT":
      requiredPermission = `update_${resourceName}`;
      break;
    case "DELETE":
      requiredPermission = `delete_${resourceName}`;
      break;
  }
  const userPermissions =
    permissions.find((permission) => permission.role === req.user.role.name)
      ?.permissions || [];

  if (!userPermissions.includes(requiredPermission)) {
    return res.status(403).json({ error: "Anda tidak memiliki akses." });
  }

  // If the user has the required permission, proceed to the next middleware or route handler
  next();
};

export const authorizeDashboard = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let requiredPermission = "";
  const resourceName = "dashboard";

  switch (req.method) {
    case "GET":
      requiredPermission = `read_${resourceName}`;
      break;
    case "POST":
      requiredPermission = `create_${resourceName}`;
      break;
    case "PUT":
      requiredPermission = `update_${resourceName}`;
      break;
    case "DELETE":
      requiredPermission = `delete_${resourceName}`;
      break;
  }

  const userPermissions =
    permissions.find((permission) => permission.role === req.user.role.name)
      ?.permissions || [];

  if (!userPermissions.includes(requiredPermission)) {
    return res.status(403).json({ error: "Anda tidak memiliki akses." });
  }

  // If the user has the required permission, proceed to the next middleware or route handler
  next();
};

export const authorizeSuppliers = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let requiredPermission = "";
  const resourceName = "suppliers";

  switch (req.method) {
    case "GET":
      requiredPermission = `read_${resourceName}`;
      break;
    case "POST":
      requiredPermission = `create_${resourceName}`;
      break;
    case "PUT":
      requiredPermission = `update_${resourceName}`;
      break;
    case "DELETE":
      requiredPermission = `delete_${resourceName}`;
      break;
  }
  const userPermissions =
    permissions.find((permission) => permission.role === req.user.role.name)
      ?.permissions || [];

  if (!userPermissions.includes(requiredPermission)) {
    return res.status(403).json({ error: "Anda tidak memiliki akses." });
  }

  // If the user has the required permission, proceed to the next middleware or route handler
  next();
};

export const authorizeCustomers = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let requiredPermission = "";
  const resourceName = "customers";

  switch (req.method) {
    case "GET":
      requiredPermission = `read_${resourceName}`;
      break;
    case "POST":
      requiredPermission = `create_${resourceName}`;
      break;
    case "PUT":
      requiredPermission = `update_${resourceName}`;
      break;
    case "DELETE":
      requiredPermission = `delete_${resourceName}`;
      break;
  }

  const userPermissions =
    permissions.find((permission) => permission.role === req.user.role.name)
      ?.permissions || [];

  if (!userPermissions.includes(requiredPermission)) {
    return res.status(403).json({ error: "Anda tidak memiliki akses." });
  }

  // If the user has the required permission, proceed to the next middleware or route handler
  next();
};

export const authorizePurchases = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let requiredPermission = "";
  const resourceName = "purchases";

  switch (req.method) {
    case "GET":
      requiredPermission = `read_${resourceName}`;
      break;
    case "POST":
      requiredPermission = `create_${resourceName}`;
      break;
    case "PUT":
      requiredPermission = `update_${resourceName}`;
      break;
    case "DELETE":
      requiredPermission = `delete_${resourceName}`;
      break;
  }

  const userPermissions =
    permissions.find((permission) => permission.role === req.user.role.name)
      ?.permissions || [];

  if (!userPermissions.includes(requiredPermission)) {
    return res.status(403).json({ error: "Anda tidak memiliki akses." });
  }

  // If the user has the required permission, proceed to the next middleware or route handler
  next();
};

export const authorizeCashier = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let requiredPermission = "";
  const resourceName = "cashier";

  switch (req.method) {
    case "GET":
      requiredPermission = `read_${resourceName}`;
      break;
    case "POST":
      requiredPermission = `create_sales`;
      break;
  }

  const userPermissions =
    permissions.find((permission) => permission.role === req.user.role.name)
      ?.permissions || [];

  if (!userPermissions.includes(requiredPermission)) {
    return res.status(403).json({ error: "Anda tidak memiliki akses." });
  }

  // If the user has the required permission, proceed to the next middleware or route handler
  next();
};
