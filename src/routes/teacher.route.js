import express from "express";
import teacherController from "../controllers/teacher.controller.js";
const router = express.Router();

router.get("/dashboard", teacherController.teacherDetails); //student details/dashboard
router.get("/subjects", teacherController.teacherSubjects); // student subjects
router.get("/notes", teacherController.teacherNotes); //student notes
router.get("/labs", teacherController.teacherLabs); //student labs
router.get("/assignment", teacherController.teacherAssignment); //student assignment

export default router;
