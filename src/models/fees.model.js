import mongoose from "mongoose";

const feesSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  session: { type: String, required: true },
  status: { type: String, enum: ["paid", "pending"], default: "pending" },
});

feesSchema.index({ studentId: 1, session: 1 }, { unique: true });

const feesModel = mongoose.model("Fees", feesSchema);

export default feesModel;
