import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    rollNumber: { type: String, unique: true, required: true },
    year: {
      type: Number,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    profilePictureUrl: String,
    profilePictureFileId: String,
    fatherName: String,
    phoneNumber: String,
    address: String,
    academicSession: { type: String, required: true },
    addharCardNumber: { type: String },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

const studentProfileModel = mongoose.model("Student", studentProfileSchema);
export default studentProfileModel;
