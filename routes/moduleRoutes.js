import express from "express";
import {
  getAllPermissions,
} from "../controllers/moduleController.js";

const moduleRoutes = express.Router();

moduleRoutes.get("/all-modules", getAllPermissions);

export default moduleRoutes;