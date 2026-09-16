import express from "express";
import teacherController from "../controllers/teacher.controller.js";
import protect from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/search", protect, teacherController.searchStudent);
router.get("/dashboard", protect, teacherController.teacherDashboard);
router.get("/students", protect, teacherController.getStudents);
router.get("/student/:studentId", protect, teacherController.getStudentDetails);
router.get("/subjects", protect, teacherController.getTeacherSubject);
router.get("/attendance", protect, teacherController.getAttendanceRoster);
router.post("/attendance", protect, teacherController.saveAttendance);
router.get("/subject/:subjectId", protect, teacherController.getSubjectDetails);
router.get("/fees", protect, teacherController.getStudentFees);
router.get("/timetable", protect, teacherController.getTeacherTimetable);

export default router;
