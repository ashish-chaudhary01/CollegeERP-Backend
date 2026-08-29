import studentProfileModel from "../models/studentProfile.model.js";
import subjectModel from "../models/subject.model.js";
import teacherProfileModel from "../models/teacherProfile.model.js";

// search student
async function searchStudent(req, res) {
  try {
    const userId = req.user.id;
    // hod teacher profile
    const hodProfile = await teacherProfileModel.findOne({ userId });

    if (!hodProfile) {
      return res.status(404).json({ message: "Hod Profile Not Found" });
    }
    // hod department id
    const departmentId = hodProfile.department;

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
      .json({ message: "Error in hod controller at search student" });
  }
}

// get hod dashboard
async function getHodDashboard(req, res) {}

// add new student
async function addStudent(req, res) {}

// get department students
async function getStudents(req, res) {
  try {
    const userId = req.user.id;
    // hod teacher profile
    const hodProfile = await teacherProfileModel.findOne({ userId });

    if (!hodProfile) {
      return res.status(404).json({ message: "Hod Profile Not Found" });
    }
    // hod department id
    const departmentId = hodProfile.department;

    // students of same department
    const students = await studentProfileModel
      .find({ department: departmentId })
      .populate("userId", "name email")
      .populate("department", "name code");

    res.status(200).json({ students });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error in hod controller at getStudents" });
  }
}

//get student details
async function getStudentDetails(req, res) {}

// add new teacher
async function addTeacher(req, res) {}

// get department teachers
async function getTeachers(req, res) {
  try {
    const userId = req.user.id;
    // hod teacher profile
    const hodProfile = await teacherProfileModel.findOne({ userId });

    if (!hodProfile) {
      return res.status(404).json({ message: "Hod Profile Not Found" });
    }
    // hod department id
    const departmentId = hodProfile.department;

    // teachers of same department
    const teachers = await teacherProfileModel
      .find({ department: departmentId })
      .populate("userId", "name email")
      .populate("department", "name code");

    res.status(200).json({ teachers });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error in hod controller at getTeachers" });
  }
}

// get teacher details
async function getTeacherDetails(req, res) {}

// add new subject
async function addSubject(req, res) {}

// get department subjects
async function getSubjects(req, res) {
  try {
    const userId = req.user.id;
    // hod teacher profile
    const hodProfile = await teacherProfileModel.findOne({ userId });

    if (!hodProfile) {
      return res.status(404).json({ message: "Hod Profile Not Found" });
    }
    // hod department id
    const departmentId = hodProfile.department;

    // teachers of same department
    const subjects = await subjectModel
      .find({ departmentId: departmentId })
      .populate("department", "name code");

    res.status(200).json({ subjects });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error in hod controller at getSubjects" });
  }
}

// get subject details
async function getSubjectDetails(req, res) {}

// get fees details
async function getStudentFess(req, res) {
  try {
    const userId = req.user.id;
    // hod teacher profile
    const hodProfile = await teacherProfileModel.findOne({ userId });

    if (!hodProfile) {
      return res.status(404).json({ message: "Hod Profile Not Found" });
    }
    // hod department id
    const departmentId = hodProfile.department;

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
      .json({ message: "Error in hod controller at getStudentFees" });
  }
}

export default {
  searchStudent,
  getHodDashboard,
  getStudents,
  getTeachers,
  getSubjects,
  getStudentFess,
};
