import mongoose from "mongoose";

const teacherAttendanceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
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

// compound index for no duplicate attendance
teacherAttendanceSchema.index(
  {
    teacherId: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

const teacherAttendanceModel = mongoose.model(
  "TeacherAttendance",
  teacherAttendanceSchema,
);

export default teacherAttendanceModel;
