import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import categoriesRoute from "./routes/categories-route.js";
import productsRoute from "./routes/products-route.js";
import usersRoute from "./routes/users-route.js";
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
import dotenv from "dotenv";

const app = express();
dotenv.config();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["https://kud-henna.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.json({ message: "hello world" });
});
app.use("/auth", authRoute);
app.get("/dashboard/:year", authenticateToken, getSalesData);
app.use("/categories", authenticateToken, categoriesRoute);
app.use("/products", authenticateToken, productsRoute);
app.use("/export/products", authenticateToken, exportProducts);
app.use("/users", authenticateToken, usersRoute);
app.use("/members", authenticateToken, membersRoute);
app.use("/sales", authenticateToken, salesRoute);
app.use("/credit-payment", authenticateToken, creditPaymentRoute);
app.use("/purchases", authenticateToken, purchasesRoute);
app.use("/suppliers", authenticateToken, suppliersRoute);
app.use("/cashier", authenticateToken, cashierRoute);
app.use("/groups", authenticateToken, groupsRoute);

export default app;
