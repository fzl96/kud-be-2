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
import morgan from "morgan";
import swaggerUI from "swagger-ui-express";
import { specs } from "./utils/swagger.js";
import { authorize } from "./middleware/permissions-middleware.js";

const app = express();
dotenv.config();

app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.json({ message: "hello world" });
});
app.use("/auth", authRoute);
app.get("/dashboard/:year", authenticateToken, authorize, getSalesData);
app.use("/categories", authenticateToken, authorize, categoriesRoute);
app.use("/products", authenticateToken, productsRoute);
app.use("/export/products", authenticateToken, authorize, exportProducts);
app.use("/users", authenticateToken, authorize, usersRoute);
app.use("/members", authenticateToken, authorize, membersRoute);
app.use("/sales", authenticateToken, authorize, salesRoute);
app.use("/credit-payment", authenticateToken, authorize, creditPaymentRoute);
app.use("/purchases", authenticateToken, authorize, purchasesRoute);
app.use("/suppliers", authenticateToken, authorize, suppliersRoute);
app.use("/cashier", authenticateToken, authorize, cashierRoute);
app.use("/groups", authenticateToken, authorize, groupsRoute);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));
app.use((req, res, next) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
