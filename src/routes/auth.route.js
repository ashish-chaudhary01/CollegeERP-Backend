import express from "express";
import authController from "../controllers/auth.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", authController.loginUser); //login route
router.post("/logout", authController.logoutUser); //logout route
router.put("/changePassword/:userId", protect, authController.changePassword); // change password route
router.post("/reset-password", authController.resetPassword); //reset password
export default router;
