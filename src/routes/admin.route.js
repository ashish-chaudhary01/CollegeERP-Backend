import express from "express";
import adminController from "../controllers/admin.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminController.getAdminDetails);
router.get("/search", protect, adminController.adminSearch);
router.get("/departments", protect, adminController.getAllDepartment);
router.post("/department", protect, adminController.createDepartment);
router.post(
  "/department/:departmentId/assign-hod",
  protect,
  adminController.assignHod,
);
router.get("/students", protect, adminController.getAllStudent);
router.post("/student", protect, adminController.createStudent);
router.get("/teachers", protect, adminController.getAllTeacher);
router.post("/teacher", protect, adminController.createTeacher);
router.get("/subjects", protect, adminController.getAllSubjects);
router.post("/subject", protect, adminController.createSubject);
// router.get("/attendance",);
// router.get("/timetable", );
// router.get("/fees", );

export default router;
