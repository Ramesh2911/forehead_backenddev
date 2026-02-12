import express from "express";
import {
  sendOtp,
  resendOtp,
  verifyOtp
} from "../controllers/otpController.js";

const otpRoutes = express.Router();

otpRoutes.post("/send-otp", sendOtp);
otpRoutes.post("/resend-otp", resendOtp);
otpRoutes.post("/verify-otp", verifyOtp);

export default otpRoutes;
