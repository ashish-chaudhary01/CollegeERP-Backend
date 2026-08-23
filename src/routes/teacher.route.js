import express from "express";
import teacherController from "../controllers/teacher.controller.js";
const router = express.Router();

router.get("/dashboard", teacherController.teacherDetails); //teacher details/dashboard
router.get("/subjects", teacherController.teacherSubjects); // teacher subjects
router.get("/notes", teacherController.teacherNotes); //teacher notes
router.get("/labs", teacherController.teacherLabs); //teacher labs
router.get("/assignment", teacherController.teacherAssignment); //teacher assignment

export default router;
