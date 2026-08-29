import express from "express";
import protect from "../middlewares/auth.middleware.js";
import hodController from "../controllers/hod.controller.js";
const router = express.Router();

router.get("/search", protect, hodController.searchStudent);
router.get("/dashboard", protect, hodController.getHodDashboard);
router.get("/students", protect, hodController.getStudents);
router.get("/teachers", protect, hodController.getTeachers);
router.get("/subjects", protect, hodController.getSubjects);
router.get("/fees", protect, hodController.getStudentFess);

export default router;
