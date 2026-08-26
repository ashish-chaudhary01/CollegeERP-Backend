import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true, unique: true },
  departmentCode: { type: String, required: true, unique: true },
  description: String,
  hod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    default: null,
  },
});

const departmentModel = mongoose.model("Department", departmentSchema);

export default departmentModel;
