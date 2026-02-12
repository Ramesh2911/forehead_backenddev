import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "../routes/authRoutes.js";
import otpRoutes from "../routes/otpRoutes.js";
import retailerRoutes from "../routes/retailerRoutes.js";
import moduleRoutes from "../routes/moduleRoutes.js";

dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/api", authRoutes);
app.use("/api", otpRoutes);
app.use("/api" , retailerRoutes)
app.use("/api" , moduleRoutes)

// health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "FOREHEAD API running" });
});

export default app;
