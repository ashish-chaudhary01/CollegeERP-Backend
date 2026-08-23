import express from "express";
import { loginUser } from "../controllers/auth.controller.js";
import { signUpUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", loginUser); //login route
router.post("/signup", signUpUser); //signup route

export default router;
