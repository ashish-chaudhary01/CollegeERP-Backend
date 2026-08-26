import mongoose from "mongoose";

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    profilePictureUrl: {
      type: String,
      default: "",
    },
    designation: {
      type: String,
      default: "Teacher",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

const teacherProfileModel = mongoose.model("Teacher", teacherProfileSchema);
export default teacherProfileModel;
