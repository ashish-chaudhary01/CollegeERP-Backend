import express from "express";
import { loginUser } from "../controllers/auth.controller.js";
i;

const router = express.Router();

router.post("/login", loginUser); //login route

export default router;
