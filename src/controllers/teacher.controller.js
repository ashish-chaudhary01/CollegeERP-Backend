import feesModel from "../models/fees.model.js";
import studentProfileModel from "../models/studentProfile.model.js";
import subjectModel from "../models/subject.model.js";
import subjectAssignmentModel from "../models/subjectAssignment.model.js";
import teacherProfileModel from "../models/teacherProfile.model.js";

// search student
async function searchStudent(req, res) {
  try {
    const userId = req.user.id;
    //  teacher profile
    const teacherProfile = await teacherProfileModel.findOne({ userId });

    if (!teacherProfile) {
      return res.status(404).json({ message: "teacher Profile Not Found" });
    }
    // teacher department id
    const departmentId = teacherProfile.department;

    // student roll number
    const { rollNumber } = req.query;

    const student = await studentProfileModel
      .findOne({
        department: departmentId,
        rollNumber: rollNumber,
      })
      .populate({ path: "userId", select: "name email" })
      .populate({ path: "department" });

    res.status(200).json({ student });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Error in teacher controller at search student" });
  }
}

// get teacher dashboard
async function teacherDashboard(req, res) {}

// get department students
async function getStudents(req, res) {
  try {
    const userId = req.user.id;
    //  teacher profile
    const teacherProfile = await teacherProfileModel.findOne({ userId });

    if (!teacherProfile) {
      return res.status(404).json({ message: "teacher Profile Not Found" });
    }
    // hod department id
    const departmentId = teacherProfile.department;

    // students of same department
    const students = await studentProfileModel
      .find({ department: departmentId })
      .populate("userId", "name email")
      .populate("department", "name code");

    res.status(200).json({ students });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Error in teacher controller at getStudents" });
  }
}

//get student details
async function getStudentDetails(req, res) {
  try {
    const { studentId } = req.params;
    const student = await studentProfileModel
      .findById(studentId)
      .populate([
        { path: "userId", select: "name email" },
        { path: "department" },
      ]);

    if (!student) {
      res.status(404).json({ message: "No student found" });
    }

    const fees = await feesModel.findOne({ studentId: studentId });

    res.status(200).json({ student, fees });
  } catch (error) {
    console.log(error.message);
  }
}

// get teacher subjects
async function getTeacherSubject(req, res) {
  try {
    const userId = req.user.id;
    //  teacher profile
    const teacherProfile = await teacherProfileModel.findOne({ userId });

    if (!teacherProfile) {
      return res.status(404).json({ message: "teacher Profile Not Found" });
    }

    // teacher id
    const teacherId = teacherProfile._id;

    // subject teacher teaches
    const teacherSubjects = await subjectAssignmentModel
      .find({ teacherId: teacherId })
      .populate({ path: "subjectId" });

    res.status(200).json({ teacherSubjects });
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
      .populate({ path: "teacherId", populate: [{ path: "userId" }] });

    res.status(200).json({ subject, assignedTeacher });
  } catch (error) {
    console.log("Error in fecthing subject details", error.message);
  }
}

// get fees details
async function getStudentFees(req, res) {
  try {
    const userId = req.user.id;
    //  teacher profile
    const teacherProfile = await teacherProfileModel.findOne({ userId });

    if (!teacherProfile) {
      return res.status(404).json({ message: "teacher Profile Not Found" });
    }

    // teacher department id
    const departmentId = teacherProfile.department;

    const { session } = req.params;
    // fess of same department students
    const fees = await feesModel.find({ session: session }).populate({
      path: "studentId",
      match: {
        ...(departmentId && {
          department: departmentId,
        }),
      },
      populate: [
        {
          path: "userId",
          select: "name email",
        },
        {
          path: "department",
          select: "name code",
        },
      ],
    });
    res.status(200).json({ fees });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Error in teacher controller at getStudentFees" });
  }
}

export default {
  searchStudent,
  getStudents,
  teacherDashboard,
  getStudentDetails,
  getTeacherSubject,
  getSubjectDetails,
  getStudentFees,
};
