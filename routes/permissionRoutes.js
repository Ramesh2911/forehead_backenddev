import express from "express";
import {
    getUserPermissions,
} from "../controllers/permissionController.js";

const permissionRoutes = express.Router();

permissionRoutes.get("/all-permission", getUserPermissions);

export default permissionRoutes;