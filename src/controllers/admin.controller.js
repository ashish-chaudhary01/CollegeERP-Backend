import departmentModel from "../models/department.model.js";
import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import studentProfileModel from "../models/studentProfile.model.js";
import teacherProfileModel from "../models/teacherProfile.model.js";
import subjectModel from "../models/subject.model.js";

// get admin details
async function getAdminDetails(req, res) {}

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
  const subjects = await subjectModel.find().populate({ path: "departmentId" });

  res.status(200).json({ subjects });
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

export default {
  getAdminDetails,
  adminSearch,
  createDepartment,
  getAllDepartment,
  createStudent,
  getAllStudent,
  createTeacher,
  getAllTeacher,
  createSubject,
  getAllSubjects,
};
