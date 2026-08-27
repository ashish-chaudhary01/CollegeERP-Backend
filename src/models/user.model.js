import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    role: { type: String, enum: ["student", "teacher", "hod", "admin"] },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
