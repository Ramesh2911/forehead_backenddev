import express from "express";
import {
  registerSuperAdmin,
  loginSuperAdmin,
  logoutSuperAdmin
} from "../controllers/authController.js";

import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

const authRoutes = express.Router();

/* ===============================
   SUPER ADMIN ROUTES
================================ */

// one-time setup
authRoutes.post("/super-admin/register", registerSuperAdmin);

// login
authRoutes.post("/super-admin/login", loginSuperAdmin);

// logout
authRoutes.post(
  "/super-admin/logout",
  auth,
  role(1), // SUPER_ADMIN
  logoutSuperAdmin
);

export default authRoutes;
