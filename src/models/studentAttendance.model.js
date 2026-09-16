import mongoose from "mongoose";

const studentAttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["present", "absent", "leave"],
    required: true,
  },
});

//
studentAttendanceSchema.index(
  {
    student: 1,
    subject: 1,
    date: 1,
  },
  {
    unique: true,
    name: "student_subject_date_unique",
  },
);

const studentAttendanceModel = mongoose.model(
  "StudentAttendance",
  studentAttendanceSchema,
);

export default studentAttendanceModel;
