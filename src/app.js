import express from "express";
import cors from "cors";
import dotenv from "dotenv";

 import authRoutes from "../routes/authRoutes.js";


dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
 app.use("/api", authRoutes);

// health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "FOREHEAD API running" });
});

export default app;
