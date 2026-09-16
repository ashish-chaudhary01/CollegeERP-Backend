import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  day: {
    type: String,
    enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    required: true,
  },
  },
  { timestamps: true },
);

timetableSchema.index({ subject: 1, day: 1, startTime: 1 }, { unique: true });

const timetableModel = mongoose.model("TimeTable", timetableSchema);

export default timetableModel;
