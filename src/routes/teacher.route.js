import express from "express";
import teacherController from "../controllers/teacher.controller.js";
import protect from "../middlewares/auth.middleware.js";
import imageUpload from "../middlewares/upload.middleware.js";
import profileController from "../controllers/profile.controller.js";
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
router.get("/profile", protect, teacherController.getTeacherProfile);
router.put("/profile", protect, teacherController.updateTeacherProfile);
router.post(
  "/profile/photo",
  protect,
  imageUpload.single("profilePhoto"),
  profileController.uploadProfilePhoto,
);
router.delete("/profile/photo", protect, profileController.deleteProfilePhoto);

export default router;
