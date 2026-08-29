import express from "express";
import adminController from "../controllers/admin.controller.js";
import protect from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorizeRole("admin"),
  adminController.getAdminDashboard,
);
router.get(
  "/search",
  protect,
  authorizeRole("admin"),
  adminController.adminSearch,
);
router.get(
  "/departments",
  protect,
  authorizeRole("admin"),
  adminController.getAllDepartment,
);
router.post(
  "/department",
  protect,
  authorizeRole("admin"),
  adminController.createDepartment,
);
router.get(
  "/department/:departmentId",
  protect,
  authorizeRole("admin"),
  adminController.getDepartmentDetails,
);
router.post(
  "/department/:departmentId/assign-hod",
  protect,
  authorizeRole("admin"),
  adminController.assignHod,
);
router.get(
  "/students",
  protect,
  authorizeRole("admin"),
  adminController.getAllStudent,
);
router.post(
  "/student",
  protect,
  authorizeRole("admin"),
  adminController.createStudent,
);
router.get(
  "/student/:studentId",
  protect,
  authorizeRole("admin"),
  adminController.getStudentDetails,
);
router.get(
  "/teachers",
  protect,
  authorizeRole("admin"),
  adminController.getAllTeacher,
);
router.post(
  "/teacher",
  protect,
  authorizeRole("admin"),
  adminController.createTeacher,
);
router.get(
  "/teacher/:teacherId",
  protect,
  authorizeRole("admin"),
  adminController.getTeacherDetails,
);
router.get(
  "/subjects",
  protect,
  authorizeRole("admin"),
  adminController.getAllSubjects,
);
router.post(
  "/subject",
  protect,
  authorizeRole("admin"),
  adminController.createSubject,
);
router.post(
  "/subject/:subjectId",
  protect,
  authorizeRole("admin"),
  adminController.assignSubject,
);
router.get(
  "/attendance",
  protect,
  authorizeRole("admin"),
  adminController.getAttendance,
);
// router.get("/timetable", );
router.get("/fees", protect, authorizeRole("admin"), adminController.getFees);

export default router;
