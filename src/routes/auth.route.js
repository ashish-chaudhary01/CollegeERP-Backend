import express from "express";
import authController from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", authController.loginUser); //login route
router.post("/logout", authController.logoutUser); //logout route
router.put("/changePassword/:userId", authController.changePassword); // change password route
export default router;
