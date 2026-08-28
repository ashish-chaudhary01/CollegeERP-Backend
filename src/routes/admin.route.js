import express from "express";
import adminController from "../controllers/admin.controller.js";
import protect from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorizeRole("admin"),
  adminController.getAdminDetails,
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
// router.get("/attendance",);
// router.get("/timetable", );
// router.get("/fees", );

export default router;
