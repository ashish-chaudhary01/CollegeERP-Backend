import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true, unique: true },
  departmentCode: { type: String, required: true, unique: true },
  description: String,
});

const departmentModel = mongoose.model("Department", departmentSchema);

export default departmentModel;
