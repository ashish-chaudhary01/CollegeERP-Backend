import express from "express";
import adminController from "../controllers/admin.controller.js";

const router = express.Router();

// router.get("/dashboard", hodController.hodDetails);
router.get("/search", hodController.hodDetails);
router.get("/departments", adminController.getAllDepartment);
router.post("/department", adminController.createDepartment);
router.get("/students", adminController.getAllStudent);
router.post("/student", adminController.createStudent);
router.get("/teachers", adminController.getAllTeacher);
router.post("/teacher", adminController.createTeacher);
router.get("/subjects", adminController.getAllSubjects);
router.post("/subject", adminController.createSubject);
// router.get("/attendance", hodController.hodLabs);
// router.get("/timetable", hodController.hodLabs);
// router.get("/fees", hodController.hodLabs);

export default router;
