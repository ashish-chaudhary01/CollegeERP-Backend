import feesModel from "../models/fees.model.js";
import studentProfileModel from "../models/studentProfile.model.js";
import subjectModel from "../models/subject.model.js";
import subjectAssignmentModel from "../models/subjectAssignment.model.js";

// get student dashboard
async function studentDashboard(req, res) {}

//get student profile
async function studentProfile(req, res) {
  try {
    const userId = req.user.id;
    const student = await studentProfileModel
      .findOne({ userId: userId })
      .populate([
        { path: "userId", select: "name email" },
        { path: "department" },
      ]);

    if (!student) {
      res.status(404).json({ message: "No student found" });
    }

    res.status(200).json({ student });
  } catch (error) {
    console.log(error.message);
  }
}

// get student subjects
async function getStudentSubjects(req, res) {
  try {
    const userId = req.user.id;
    //  student profile
    const student = await studentProfileModel.findOne({ userId });

    if (!student) {
      return res.status(404).json({ message: "student Profile Not Found" });
    }

    // student all subjects
    const studentSubjects = await subjectModel.find({
      departmentId: student.department,
      year: student.year,
      semester: student.semester,
    });

    res.status(200).json({ studentSubjects });
  } catch (error) {
    console.log(error.message);
  }
}

// get subject details
async function getSubjectDetails(req, res) {
  try {
    const { subjectId } = req.params;

    const subject = await subjectModel
      .findById(subjectId)
      .populate({ path: "departmentId" });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const assignedTeacher = await subjectAssignmentModel
      .find({ subjectId: subjectId })
      .populate({
        path: "teacherId",
        populate: [{ path: "userId", select: "name" }],
      });

    res.status(200).json({ subject, assignedTeacher });
  } catch (error) {
    console.log("Error in fecthing subject details", error.message);
  }
}

// get student fees details
async function getStudentFees(req, res) {
  try {
    const userId = req.user.id;
    //  student profile
    const student = await studentProfileModel
      .findOne({ userId })
      .populate({ path: "userId", select: "name email" });

    if (!student) {
      return res.status(404).json({ message: "student Profile Not Found" });
    }

    // fess of same department students
    const studentFees = await feesModel.find({ studentId: student._id });
    res.status(200).json({ student, studentFees });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Error in student controller at getStudentFees" });
  }
}

export default {
  studentDashboard,
  studentProfile,
  getStudentSubjects,
  getSubjectDetails,
  getStudentFees,
};
