import feesModel from "../models/fees.model.js";
import studentProfileModel from "../models/studentProfile.model.js";
import subjectModel from "../models/subject.model.js";
import teacherProfileModel from "../models/teacherProfile.model.js";
import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";

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
async function addStudent(req, res) {
  try {
    const {
      name,
      email,
      rollNumber,
      password,
      semester,
      year,
      academicSession,
    } = req.body;

    const userId = req.user.id;
    // hod teacher profile
    const hodProfile = await teacherProfileModel.findOne({ userId });

    if (!hodProfile) {
      return res.status(404).json({ message: "Hod Profile Not Found" });
    }
    // hod department id
    const departmentId = hodProfile.department;

    //password hash
    const passwordHash = await bcrypt.hash(password, 10);

    //creating user
    const user = await userModel.create({
      name: name,
      email: email,
      password: passwordHash,
      role: "student",
    });

    //   student profile
    const studentProfile = await studentProfileModel.create({
      userId: user._id,
      rollNumber: rollNumber,
      year: year,
      semester: semester,
      department: departmentId,
      academicSession: academicSession,
    });

    res.status(201).json({
      message: "Student created successfully",
      user,
      studentProfile,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error in adding student" });
  }
}

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

// add new teacher
async function addTeacher(req, res) {
  try {
    const { name, email, password } = req.body;

    const userId = req.user.id;
    // hod teacher profile
    const hodProfile = await teacherProfileModel.findOne({ userId });

    if (!hodProfile) {
      return res.status(404).json({ message: "Hod Profile Not Found" });
    }
    // hod department id
    const departmentId = hodProfile.department;

    //password hash
    const passwordHash = await bcrypt.hash(password, 10);

    //creating user
    const user = await userModel.create({
      name: name,
      email: email,
      password: passwordHash,
      role: "teacher",
    });

    const teacherProfile = await teacherProfileModel.create({
      userId: user._id,
      department: departmentId,
    });

    res
      .status(201)
      .json({ message: "Teacher created Successfully", user, teacherProfile });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "error while creatinf teacher" });
  }
}

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
async function getTeacherDetails(req, res) {
  try {
    const { teacherId } = req.params;

    const teacher = await teacherProfileModel
      .findById(teacherId)
      .populate([
        { path: "userId", select: "name email" },
        { path: "department" },
      ]);
    if (!teacher) {
      return res.status(404).json({ message: "No teacher found" });
    }
    const subjects = await subjectAssignmentModel
      .find({ teacherId: teacherId })
      .populate({ path: "subjectId" });

    res.status(200).json({ teacher, subjects });
  } catch (error) {
    console.log("Error in fetching teacher details", error.message);
  }
}

// add new subject
async function addSubject(req, res) {
  try {
    const { subjectName, subjectCode, semester, year } = req.body;

    const userId = req.user.id;
    // hod teacher profile
    const hodProfile = await teacherProfileModel.findOne({ userId });

    if (!hodProfile) {
      return res.status(404).json({ message: "Hod Profile Not Found" });
    }
    // hod department id
    const departmentId = hodProfile.department;

    const subject = await subjectModel.create({
      subjectName,
      subjectCode,
      departmentId,
      semester,
      year,
    });

    res.status(201).json({ message: "Subject created Successfully", subject });
  } catch (error) {}
}

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
  addStudent,
  getStudents,
  getStudentDetails,
  addTeacher,
  getTeachers,
  getTeacherDetails,
  addSubject,
  getSubjects,
  getSubjectDetails,
  getStudentFess,
};
