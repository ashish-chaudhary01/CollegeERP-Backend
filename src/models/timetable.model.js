import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectAssignment",
    required: true,
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  day: {
    type: String,
    enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    required: true,
  },
});

const timetableModel = mongoose.model("TimeTable", timetableSchema);

export default timetableModel;
