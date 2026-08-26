import mongoose from "mongoose";

const subjectAssignmentSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
});

const subjectAssignmentModel = mongoose.model(
  "SubjectAssignment",
  subjectAssignmentSchema,
);

export default subjectAssignmentModel;
