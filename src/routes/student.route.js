import express from "express";
import studentController from "../controllers/student.controller.js";
import protect from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/dashboard", protect, studentController.studentDashboard);
router.get("/student/:studentId", protect, studentController.studentProfile);
router.get("/subjects", protect, studentController.getStudentSubjects);
router.get("/subject/:subjectId", protect, studentController.getSubjectDetails);
router.get("/fees", protect, studentController.getStudentFees);

export default router;
