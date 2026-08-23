import express from "express";
import studentController from "../controllers/student.controller.js";
const router = express.Router();

// student subject route
router.get("/subjects", studentController.studentSubjects);
router.get("/notes", studentController.studentNotes);
router.get("/labs", studentController.studentLabs);
router.get("/assignment", studentController.studentAssignment);

export default router;
