import express from "express";
import {
  listAllSubscriptions,
  getSubscriptionDetails,
} from "../controllers/subscriptionController.js";

const subscriptionRoutes = express.Router();

subscriptionRoutes.get("/all-subscriptions", listAllSubscriptions);
subscriptionRoutes.get("/subcription-details", getSubscriptionDetails);

export default subscriptionRoutes;
