import mongoose from "mongoose";

const studentAttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectAssignment",
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
    assignment: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

const studentAttendanceModel = mongoose.model(
  "StudentAttendance",
  studentAttendanceSchema,
);

export default studentAttendanceModel;
