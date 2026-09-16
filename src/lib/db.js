import mongoose from "mongoose";
import studentAttendanceModel from "../models/studentAttendance.model.js";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const attendanceIndexes = await studentAttendanceModel.collection.indexes();
    const legacyIndexes = attendanceIndexes.filter((index) => {
      const isLegacyName = [
        "studentId_1_assignmentId_1_date_1",
        "student_id_assignment_id_date_unique",
      ].includes(index.name);
      const isUnnamedCurrentIndex =
        index.name !== "student_subject_date_unique" &&
        JSON.stringify(index.key) ===
          JSON.stringify({ student: 1, subject: 1, date: 1 });
      return isLegacyName || isUnnamedCurrentIndex;
    });
    for (const index of legacyIndexes) {
      await studentAttendanceModel.collection.dropIndex(index.name);
      console.log(`Removed legacy attendance index: ${index.name}`);
    }
    await studentAttendanceModel.createIndexes();
    console.log("DB connected");
  } catch (error) {
    console.log("Error in database");
    console.log(error.message);
  }
}
