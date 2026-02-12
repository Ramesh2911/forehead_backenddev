import express from "express";
import {
  getAllCustomers,
  getCustomerDetails
} from "../controllers/customerController.js";

const customerRoutes = express.Router();

customerRoutes.get("/all-customers", getAllCustomers);
customerRoutes.get("/customer-details", getCustomerDetails);

export default customerRoutes;
