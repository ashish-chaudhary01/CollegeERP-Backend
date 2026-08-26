import express from "express";

const router = express.Router();

router.get("/dashboard", hodController.hodDetails);
router.get("/search", hodController.hodDetails);
router.get("/departments", hodController.hodDetails);
router.get("/students", hodController.hodStudent);
router.get("/teacher", hodController.hodTeacher);
router.get("/subjects", hodController.hodSubject);
router.get("/attendance", hodController.hodLabs);
router.get("/timetable", hodController.hodLabs);
router.get("/fees", hodController.hodLabs);

export default router;
