import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import categoriesRoute from "./routes/categories-route";
import productsRoute from "./routes/products-route";
import usersRoute from "./routes/users-route";
import rolesRoute from "./routes/roles-route";
import customersRoute from "./routes/customers-route";
import salesRoute from "./routes/sales-route";
import purchasesRoute from "./routes/purchases-route";
import suppliersRoute from "./routes/suppliers-route";
import authRoute from "./routes/auth-route";
import groupsRoute from "./routes/groups-route";
import cashierRoute from "./routes/cashier-route";
import { getSalesData } from "./controllers/dashboard-controller";
import { authenticateToken } from "./middleware/auth-middleware";
import {
  authorizeCategories,
  authorizeProducts,
  authorizeUsers,
  authorizeRoles,
  authorizeSales,
  authorizeDashboard,
  authorizeCustomers,
  authorizeSuppliers,
  authorizePurchases,
  authorizeCashier,
} from "./middleware/permissions-middleware";

const app: Express = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5173",
      "https://kud.onrender.com",
      "http://localhost:3000",
      "https://kud-fe.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.get("/", authenticateToken, (req: any, res: Response) => {
  res.json(req.user);
});

app.get("/dashboard/:year", getSalesData);
app.use("/auth", authRoute);
app.use("/categories", authenticateToken, categoriesRoute);
app.use("/products", authenticateToken, productsRoute);
app.use("/users", usersRoute);
app.use("/roles", authenticateToken, rolesRoute);
app.use("/customers", authenticateToken, customersRoute);
app.use("/sales", authenticateToken, salesRoute);
app.use("/purchases", authenticateToken, purchasesRoute);
app.use("/suppliers", authenticateToken, suppliersRoute);
app.use("/cashier", authenticateToken, cashierRoute);
app.use("/groups", groupsRoute);

export default app;
