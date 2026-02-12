import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "../routes/authRoutes.js";
import otpRoutes from "../routes/otpRoutes.js";
import retailerRoutes from "../routes/retailerRoutes.js";
import moduleRoutes from "../routes/moduleRoutes.js";
import subscriptionRoutes from "../routes/subscriptionRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://forehead-admin.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// routes
app.use("/api", authRoutes);
app.use("/api", otpRoutes);
app.use("/api", retailerRoutes)
app.use("/api", moduleRoutes)
app.use("/api", subscriptionRoutes)

// health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "FOREHEAD API running" });
});

export default app;
