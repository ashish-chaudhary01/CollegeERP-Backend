import express from "express";
import protect from "../middlewares/auth.middleware.js";
import hodController from "../controllers/hod.controller.js";
import imageUpload from "../middlewares/upload.middleware.js";
import profileController from "../controllers/profile.controller.js";
const router = express.Router();

router.get("/search", protect, hodController.searchStudent);
router.get("/dashboard", protect, hodController.getHodDashboard);
router.get("/students", protect, hodController.getStudents);
router.get("/student/:studentId", protect, hodController.getStudentDetails);
router.post("/student", protect, hodController.addStudent);
router.get("/teachers", protect, hodController.getTeachers);
router.get("/teacher/:teacherId", protect, hodController.getTeacherDetails);
router.put("/teacher/:teacherId", protect, hodController.updateTeacherDetails);
router.post("/teacher", protect, hodController.addTeacher);
router.get("/subjects", protect, hodController.getSubjects);
router.get("/subject/:subjectId", protect, hodController.getSubjectDetails);
router.post("/subject", protect, hodController.addSubject);
router.get("/fees", protect, hodController.getStudentFees);
router.post("/fees/:studentId", protect, hodController.submitFees);
router.get("/profile", protect, hodController.getHodProfile);
router.put("/profile", protect, hodController.updateHodProfile);
router.post(
  "/profile/photo",
  protect,
  imageUpload.single("profilePhoto"),
  profileController.uploadProfilePhoto,
);
router.delete("/profile/photo", protect, profileController.deleteProfilePhoto);

export default router;
