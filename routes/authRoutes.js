import express from "express";
import {
  registerSuperAdmin,
  login,
  logoutSuperAdmin,
  registerRetailer,
  customerRegister,
  registerAdmin,
  changePassword
} from "../controllers/authController.js";

import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

const authRoutes = express.Router();

authRoutes.post("/super-admin/register", registerSuperAdmin);
authRoutes.post("/login", login);
authRoutes.post(
  "/super-admin/logout",
  auth,
  role(1),
  logoutSuperAdmin
);
authRoutes.post("/retailer-register", registerRetailer);
authRoutes.post("/customer-register", customerRegister);
authRoutes.post("/admin-register", registerAdmin);
authRoutes.put("/change-password", auth, changePassword)

export default authRoutes;
