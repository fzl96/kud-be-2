import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import categoriesRoute from "./routes/categories-route.js";
import categoriesDrizzleRoute from "./routes/categories-drizzle-route.js";
import productsRoute from "./routes/products-route.js";
import usersRoute from "./routes/users-route.js";
import rolesRoute from "./routes/roles-route.js";
import membersRoute from "./routes/members-route.js";
import salesRoute from "./routes/sales-route.js";
import creditPaymentRoute from "./routes/credit-payment-route.js";
import purchasesRoute from "./routes/purchases-route.js";
import suppliersRoute from "./routes/suppliers-route.js";
import authRoute from "./routes/auth-route.js";
import groupsRoute from "./routes/groups-route.js";
import cashierRoute from "./routes/cashier-route.js";
import { getSalesData } from "./controllers/dashboard-controller.js";
import { authenticateToken } from "./middleware/auth-middleware.js";
import { exportProducts } from "./controllers/products-controller.js";
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
} from "./middleware/permissions-middleware.js";

const app: Express = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5173",
      "https://kud-fe.onrender.com",
      "http://192.168.18.16:5173",
      "https://kud-henna.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.get("/", (req: any, res: Response) => {
  res.send("Hello World");
});

app.use("/auth", authRoute);
app.get("/dashboard/:year", authenticateToken, getSalesData);
app.use("/categories", authenticateToken, categoriesRoute);
// app.use("/categories-drizzle", authenticateToken, categoriesDrizzleRoute);
app.use("/products", authenticateToken, productsRoute);
app.use("/export/products", exportProducts);
app.use("/users", authenticateToken, usersRoute);
app.use("/roles", authenticateToken, rolesRoute);
app.use("/members", authenticateToken, membersRoute);
app.use("/sales", authenticateToken, salesRoute);
app.use("/credit-payment", authenticateToken, creditPaymentRoute);
app.use("/purchases", authenticateToken, purchasesRoute);
app.use("/suppliers", authenticateToken, suppliersRoute);
app.use("/cashier", authenticateToken, cashierRoute);
app.use("/groups", authenticateToken, groupsRoute);

export default app;
