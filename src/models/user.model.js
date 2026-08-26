import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    passwordHash: String,
    role: "admin" || "hod" || "teacher" || "student",
    status: "active" || "inactive",
  },
  { timestamps: true },
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
