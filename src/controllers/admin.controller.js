import departmentModel from "../models/department.model.js";
import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import studentProfileModel from "../models/studentProfile.model.js";
import teacherProfileModel from "../models/teacherProfile.model.js";
import subjectModel from "../models/subject.model.js";
import studentAttendanceModel from "../models/studentAttendance.model.js";
import subjectAssignmentModel from "../models/subjectAssignment.model.js";
import feesModel from "../models/fees.model.js";
import { populate } from "dotenv";

// get admin details
async function getAdminDashboard(req, res) {
  try {
    // for overview cards
    const totalStudents = await studentProfileModel.countDocuments();
    const totalTeachers = await teacherProfileModel.countDocuments();
    const totalDepartments = await departmentModel.countDocuments();
    const totalSubjects = await subjectModel.countDocuments();

    const currentYear = new Date().getFullYear();

    // overall attendance
    const totalPresent = await studentAttendanceModel.countDocuments({
      status: "present",
      date: {
        $regex: `^${currentYear}`,
      },
    });
    const totalabsent = await studentAttendanceModel.countDocuments({
      status: "absent",
      date: {
        $regex: `^${currentYear}`,
      },
    });

    const totalClasses = totalPresent + totalabsent;

    const overallAttendance =
      totalClasses === 0 ? 0 : (totalPresent / totalClasses) * 100;

    res.status(200).json({
      totalStudents,
      totalTeachers,
      totalDepartments,
      totalSubjects,
      attendance: {
        present: totalPresent,
        absent: totalabsent,
        overall: Number(overallAttendance).toFixed(2),
      },
    });
  } catch (error) {
    console.log("Error in admin dashboard", error.message);
  }
}

// create department
async function createDepartment(req, res) {
  const { departmentName, departmentCode, description } = req.body;

  const isDepartmentExist = await departmentModel.findOne({
    departmentName: departmentName,
    departmentCode: departmentCode,
  });

  if (isDepartmentExist) {
    return res.status(401).json({ message: "Department already exist" });
  }

  const department = await departmentModel.create({
    departmentName,
    departmentCode,
    description,
  });

  res
    .status(201)
    .json({ message: "Department Successfully created!", department });
}

// get department
async function getAllDepartment(req, res) {
  const departments = await departmentModel.find();

  res.status(200).json({
    departments,
  });
}

// get department details
async function getDepartmentDetails(req, res) {
  try {
    const { departmentId } = req.params;

    const department = await departmentModel.findById(departmentId);
    const hodId = department.hod;
    const hod = await teacherProfileModel
      .findById(hodId)
      .populate({ path: "userId", select: "name email status" });
    const departmentTeachers = await teacherProfileModel
      .find({
        department: departmentId,
      })
      .populate({ path: "userId", select: "name email status" });

    res.status(200).json({
      department,
      hod,
      departmentTeachers,
    });
  } catch (error) {
    console.log(error.message);
  }
}

// assign hod to department
async function assignHod(req, res) {
  const { departmentId } = req.params;
  const { teacherId } = req.body;

  const department = await departmentModel.findById(departmentId);

  if (!department) {
    return res.status(404).json({ message: "No department found" });
  }

  const teacher = await teacherProfileModel.findById(teacherId);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  const previousHod = await teacherProfileModel.findById(department.hod);

  // find previous hod and demote it to teacher
  if (previousHod) {
    await userModel.findByIdAndUpdate(previousHod.userId, { role: "teacher" });
  }

  // assigning new hod
  department.hod = teacher._id;
  await department.save();

  // find and update user(teacher) to hod
  await userModel.findByIdAndUpdate(teacher.userId, { role: "hod" });

  return res.status(200).json({
    message: "HOD assigned successfully",
  });
}

// create student
async function createStudent(req, res) {
  const {
    name,
    email,
    rollNumber,
    password,
    semester,
    year,
    department,
    academicSession,
  } = req.body;

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
    department: department,
    academicSession: academicSession,
  });

  res.status(201).json({
    message: "Student created successfully",
    user,
    studentProfile,
  });
}

//get all student
async function getAllStudent(req, res) {
  const students = await studentProfileModel
    .find()
    .populate([
      { path: "department" },
      { path: "userId", select: "-password" },
    ]);

  res.status(200).json({ students });
}

// get student details
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

    res.status(200).json({ student });
  } catch (error) {
    console.log(error.message);
  }
}

// create teacher
async function createTeacher(req, res) {
  const { name, email, password, department } = req.body;

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
    department,
  });

  res
    .status(201)
    .json({ message: "Teacher created Successfully", user, teacherProfile });
}

// get all teacher
async function getAllTeacher(req, res) {
  const teacher = await teacherProfileModel
    .find()
    .populate({ path: "department" });

  res.status(200).json({ teacher });
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

// create subject
async function createSubject(req, res) {
  const { subjectName, departmentId, subjectCode, semester, year } = req.body;

  const subject = await subjectModel.create({
    subjectName,
    subjectCode,
    departmentId,
    semester,
    year,
  });

  res.status(201).json({ message: "Subject created Successfully", subject });
}

// get all subject
async function getAllSubjects(req, res) {
  const subjects = await subjectModel.find().populate({ path: "department" });

  res.status(200).json({ subjects });
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

// assign subject to teacher
async function assignSubject(req, res) {
  const { subjectId } = req.params;
  const { teacherId } = req.body;

  const subject = await subjectModel.findById(subjectId);
  if (!subject) {
    return res.status(404).json({ message: "No subject Found" });
  }

  await subjectAssignmentModel.create({
    subjectId,
    teacherId,
  });

  res.status(201).json({ message: "Subject assigned successfully" });
}

// search students
async function adminSearch(req, res) {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "search query is required" });
    }

    const student = await studentProfileModel
      .findOne({ rollNumber: query })
      .populate({ path: "userId", select: "name email" })
      .populate({
        path: "department",
        select: "departmentName departmentCode",
      });

    res.status(200).json({ student });
  } catch (error) {
    res.status(500).json({ message: "Error in admin search controller" });
    console.log(error.message);
  }
}

// get attendance whole
async function getAttendance(req, res) {}

// get fees of students
async function getFees(req, res) {
  try {
    const { session } = req.params;
    const { department, semester, status } = req.query;

    const feeFilter = {
      session,
    };

    if (status) {
      feeFilter.status = status;
    }

    const fees = await feesModel.find(feeFilter).populate({
      path: "studentId",
      match: {
        ...(department && {
          department: department,
        }),

        ...(semester && {
          semester: Number(semester),
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

    const result = fees.filter((fee) => fee.studentId !== null);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export default {
  assignHod,
  getAdminDashboard,
  adminSearch,
  createDepartment,
  getAllDepartment,
  getDepartmentDetails,
  createStudent,
  getAllStudent,
  getStudentDetails,
  createTeacher,
  getAllTeacher,
  getTeacherDetails,
  createSubject,
  getAllSubjects,
  getAttendance,
  assignSubject,
  getSubjectDetails,
  getFees,
};
