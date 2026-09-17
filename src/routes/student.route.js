import express from "express";
import studentController from "../controllers/student.controller.js";
import protect from "../middlewares/auth.middleware.js";
import imageUpload from "../middlewares/upload.middleware.js";
import profileController from "../controllers/profile.controller.js";
const router = express.Router();

router.get("/dashboard", protect, studentController.studentDashboard);
router.get("/student/:studentId", protect, studentController.studentProfile);
router.get("/profile", protect, studentController.studentProfile);
router.get("/subjects", protect, studentController.getStudentSubjects);
router.get("/subject/:subjectId", protect, studentController.getSubjectDetails);
router.get("/fees", protect, studentController.getStudentFees);
router.get("/attendance", protect, studentController.getStudentAttendance);
router.get("/timetable", protect, studentController.getStudentTimetable);
router.put("/profile", protect, studentController.updateStudentProfile);
router.post(
  "/profile/photo",
  protect,
  imageUpload.single("profilePhoto"),
  profileController.uploadProfilePhoto,
);
router.delete("/profile/photo", protect, profileController.deleteProfilePhoto);

export default router;
