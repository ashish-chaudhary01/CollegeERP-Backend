import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    subjectName: { type: String, required: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    subjectCode: { type: String, unique: true, required: true },
    year: {
      type: Number,
      required: true,
    },

    semester: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const subjectModel = mongoose.model("Subject", subjectSchema);

export default subjectModel;
