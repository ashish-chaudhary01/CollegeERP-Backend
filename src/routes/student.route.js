import express from "express";
import studentController from "../controllers/student.controller.js";
const router = express.Router();

router.get("/dashboard", studentController.studentDetails); //student details/dashboard
router.get("/subjects", studentController.studentSubjects); // student subjects
router.get("/notes", studentController.studentNotes); //student notes
router.get("/labs", studentController.studentLabs); //student labs
router.get("/assignment", studentController.studentAssignment); //student assignment

export default router;
