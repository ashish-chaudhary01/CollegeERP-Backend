import express from "express";
import teacherController from "../controllers/teacher.controller.js";
const router = express.Router();

router.get("/search", protect, teacherController.searchStudent);
router.get("/dashboard", protect, teacherController.teacherDashboard);
router.get("/students", protect, teacherController.getStudents);
router.get("/student/:studentId", protect, teacherController.getStudentDetails);
router.get("/subjects", protect, teacherController.getTeacherSubject);
router.get("/subject/:subjectId", protect, teacherController.getSubjectDetails);
router.get("/fees", protect, teacherController.getStudentFees);

export default router;
