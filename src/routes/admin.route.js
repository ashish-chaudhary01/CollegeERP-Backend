import express from "express";
import adminController from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard", adminController.getAdminDetails);
router.get("/search", adminController.adminSearch);
router.get("/departments", adminController.getAllDepartment);
router.post("/department", adminController.createDepartment);
router.get("/students", adminController.getAllStudent);
router.post("/student", adminController.createStudent);
router.get("/teachers", adminController.getAllTeacher);
router.post("/teacher", adminController.createTeacher);
router.get("/subjects", adminController.getAllSubjects);
router.post("/subject", adminController.createSubject);
// router.get("/attendance",);
// router.get("/timetable", );
// router.get("/fees", );

export default router;
