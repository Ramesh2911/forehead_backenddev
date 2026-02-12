import express from "express";
import {
    getRetailersList,
    getRetailerDetails
} from "../controllers/retailerController.js";

const retailerRoutes = express.Router();

retailerRoutes.get("/all-retailers", getRetailersList);
retailerRoutes.get("/retailer-details", getRetailerDetails);

export default retailerRoutes;
