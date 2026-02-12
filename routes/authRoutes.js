import express from "express";
import {
  registerSuperAdmin,
  loginSuperAdmin,
  logoutSuperAdmin,
  registerRetailer
} from "../controllers/authController.js";

import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

const authRoutes = express.Router();

authRoutes.post("/super-admin/register", registerSuperAdmin);
authRoutes.post("/super-admin/login", loginSuperAdmin);
authRoutes.post(
  "/super-admin/logout",
  auth,
  role(1), 
  logoutSuperAdmin
);
authRoutes.post("/retailer-register", registerRetailer);

export default authRoutes;
