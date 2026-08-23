import express from "express";
import hodController from "../controllers/hod.controller.js";
const router = express.Router();

// all get api's
router.get("/dashboard", hodController.hodDetails); //hod details/dashboard
router.get("/students", hodController.hodStudent); // hod department all students
router.get("/teacher", hodController.hodTeacher); // hod department all teachers
router.get("/subjects", hodController.hodSubject); // hod department all subjects
router.get("/labs", hodController.hodLabs); // hod department all labs

export default router;
