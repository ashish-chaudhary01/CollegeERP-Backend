import feesModel from "../models/fees.model.js";
import studentProfileModel from "../models/studentProfile.model.js";
import subjectModel from "../models/subject.model.js";
import teacherProfileModel from "../models/teacherProfile.model.js";
import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import studentAttendanceModel from "../models/studentAttendance.model.js";
import departmentModel from "../models/department.model.js";
import timetableModel from "../models/timetable.model.js";

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

async function getHodProfile(req, res) {
  const profile = await teacherProfileModel
    .findOne({ userId: req.user.id })
    .populate([
      { path: "userId", select: "name email role status" },
      { path: "department", select: "departmentName departmentCode" },
    ]);
  if (!profile)
    return res.status(404).json({ message: "HOD profile not found" });
  res.json({ profile });
}

async function updateHodProfile(req, res) {
  try {
    const {
      name,
      email,
      phoneNumber,
      address,
      profilePictureUrl,
      designation,
    } = req.body;
    const profile = await teacherProfileModel
      .findOneAndUpdate(
        { userId: req.user.id },
        { phoneNumber, address, profilePictureUrl, designation },
        { new: true, runValidators: true },
      )
      .populate([
        { path: "userId", select: "name email role status" },
        { path: "department", select: "departmentName departmentCode" },
      ]);
    await userModel.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { runValidators: true },
    );
    res.json({ profile });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// get hod dashboard
async function getHodDashboard(req, res) {
  try {
    const userId = req.user.id;
    // hod teacher profile
    const hodProfile = await teacherProfileModel.findOne({ userId });

    if (!hodProfile) {
      return res.status(404).json({ message: "Hod Profile Not Found" });
    }
    // hod department id
    const departmentId = hodProfile.department;

    // for overview cards
    const students = await studentProfileModel
      .find({ department: departmentId })
      .select("_id");
    const studentIds = students.map((student) => student._id);
    const totalTeachers = await teacherProfileModel.countDocuments({
      department: departmentId,
    });
    const totalSubjects = await subjectModel.countDocuments({
      departmentId: departmentId,
    });
    const totalDepartments = await departmentModel.countDocuments({
      _id: departmentId,
    });

    const currentYear = new Date().getFullYear();

    // overall attendance of department
    const totalPresent = await studentAttendanceModel.countDocuments({
      status: "present",
      date: {
        $regex: `^${currentYear}`,
      },
      student: { $in: studentIds },
    });
    const totalabsent = await studentAttendanceModel.countDocuments({
      status: "absent",
      date: {
        $regex: `^${currentYear}`,
      },
      student: { $in: studentIds },
    });

    const totalClasses = totalPresent + totalabsent;

    const overallAttendance =
      totalClasses === 0 ? 0 : (totalPresent / totalClasses) * 100;

    res.status(200).json({
      totalStudents: studentIds.length,
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
    console.log("Error in hod dashboard", error.message);
  }
}

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
      phoneNumber,
      address,
      fatherName,
      addharCardNumber,
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
      phoneNumber,
      address,
      fatherName,
      addharCardNumber,
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
      .populate("department", "departmentName departmentCode");

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
    const hodProfile = await teacherProfileModel.findOne({
      userId: req.user.id,
    });
    const student = await studentProfileModel
      .findOne({ _id: studentId, department: hodProfile?.department })
      .populate([
        { path: "userId", select: "name email" },
        { path: "department" },
      ]);

    if (!student) return res.status(404).json({ message: "No student found" });

    const fees = await feesModel.findOne({ studentId: studentId });
    const attendance = await studentAttendanceModel
      .find({ student: studentId })
      .lean();
    const present = attendance.filter(
      (record) => record.status === "present",
    ).length;
    const total = attendance.filter((record) =>
      ["present", "absent", "leave"].includes(record.status),
    ).length;

    res.status(200).json({
      student,
      fees: fees ? [fees] : [],
      attendance: {
        present,
        total,
        percentage: total ? Number(((present / total) * 100).toFixed(1)) : 0,
      },
    });
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

    const hodProfile = await teacherProfileModel.findOne({
      userId: req.user.id,
    });
    const teacher = await teacherProfileModel
      .findOne({ _id: teacherId, department: hodProfile?.department })
      .populate([
        { path: "userId", select: "name email" },
        { path: "department" },
      ]);
    if (!teacher) {
      return res.status(404).json({ message: "No teacher found" });
    }
    const subjects = await subjectModel.find({ teacherId: teacherId });

    res.status(200).json({ teacher, subjects });
  } catch (error) {
    console.log("Error in fetching teacher details", error.message);
  }
}

async function updateTeacherDetails(req, res) {
  try {
    const hodProfile = await teacherProfileModel.findOne({
      userId: req.user.id,
    });
    const { teacherId } = req.params;
    const {
      name,
      email,
      phoneNumber,
      address,
      designation,
      profilePictureUrl,
      status,
    } = req.body;
    const teacher = await teacherProfileModel
      .findOneAndUpdate(
        { _id: teacherId, department: hodProfile?.department },
        { phoneNumber, address, designation, profilePictureUrl, status },
        { new: true, runValidators: true },
      )
      .populate([
        { path: "userId", select: "name email role status" },
        { path: "department" },
      ]);
    if (!teacher)
      return res
        .status(404)
        .json({ message: "Teacher not found in your department" });
    await userModel.findByIdAndUpdate(
      teacher.userId,
      { name, email },
      { runValidators: true },
    );
    const subjects = await subjectModel.find({ teacherId });
    res.json({ message: "Teacher details updated", teacher, subjects });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// add new subject
async function addSubject(req, res) {
  try {
    const { subjectName, subjectCode, semester, year } = req.body;

    if (!subjectName || !subjectCode || !semester || !year) {
      return res.status(400).json({
        message: "Subject name, code, year and semester are required",
      });
    }

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
  } catch (error) {
    console.log(error.message);
    res.status(error.code === 11000 ? 409 : 500).json({
      message:
        error.code === 11000
          ? "A subject with this code already exists"
          : "Unable to create subject",
    });
  }
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

    const subjectsData = await subjectModel
      .find({ departmentId: departmentId })
      .populate({
        path: "departmentId",
        select: "departmentName departmentCode",
      })
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email" },
      });

    const subjects = subjectsData.map((subject) => ({
      _id: subject._id,
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      year: subject.year,
      semester: subject.semester,
      department: subject.departmentId?.departmentCode || "-",
      departmentName: subject.departmentId?.departmentName || "",
      teacherName: subject.teacherId?.userId?.name || "Not assigned",
    }));

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
    const hodProfile = await teacherProfileModel.findOne({
      userId: req.user.id,
    });

    const subject = await subjectModel
      .findOne({ _id: subjectId, departmentId: hodProfile?.department })
      .populate({ path: "departmentId" });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const assignedTeacher = subject.teacherId
      ? await teacherProfileModel
          .findById(subject.teacherId)
          .populate({ path: "userId", select: "name email" })
      : null;

    res.status(200).json({ subject, assignedTeacher });
  } catch (error) {
    console.log("Error in fecthing subject details", error.message);
  }
}

// get fees details
async function getStudentFees(req, res) {
  try {
    const userId = req.user.id;
    // hod teacher profile
    const hodProfile = await teacherProfileModel.findOne({ userId });

    if (!hodProfile) {
      return res.status(404).json({ message: "Hod Profile Not Found" });
    }
    // hod department id
    const departmentId = hodProfile.department;

    const session =
      req.query.session ||
      `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`;
    const students = await studentProfileModel
      .find({ department: departmentId })
      .populate("userId", "name email");
    const fees = await feesModel.find({
      session,
      studentId: { $in: students.map((student) => student._id) },
    });
    const feeByStudent = new Map(
      fees.map((fee) => [String(fee.studentId), fee]),
    );
    res.status(200).json({
      fees: students.map((student) => ({
        id: student._id,
        status: feeByStudent.get(String(student._id))?.status || "pending",
        session,
        studentId: student,
      })),
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Error in hod controller at getStudentFees" });
  }
}

async function getHodTimetable(req, res) {
  try {
    const profile = await teacherProfileModel.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: "HOD profile not found" });
    const subjectFilter = { departmentId: profile.department };
    if (req.query.semester && req.query.semester !== "all") subjectFilter.semester = Number(req.query.semester);
    const subjects = await subjectModel.find(subjectFilter).select("_id");
    const timetable = await timetableModel.find({ subject: { $in: subjects.map((item) => item._id) } })
      .populate({ path: "subject", select: "subjectName subjectCode year semester", populate: { path: "departmentId", select: "departmentName departmentCode" } })
      .sort({ day: 1, startTime: 1 });
    res.json({ timetable });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

async function getHodAttendanceAnalytics(req, res) {
  try {
    const profile = await teacherProfileModel.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: "HOD profile not found" });
    const currentYear = new Date().getFullYear();
    const from = req.query.from || `${currentYear}-01-01`;
    const to = req.query.to || `${currentYear}-12-31`;
    const students = await studentProfileModel.find({ department: profile.department }).populate("userId", "name").lean();
    const records = await studentAttendanceModel.find({ student: { $in: students.map((student) => student._id) }, date: { $gte: from, $lte: to } }).lean();
    const stats = new Map(); const totals = { present: 0, absent: 0, leave: 0 };
    records.forEach((record) => { totals[record.status] = (totals[record.status] || 0) + 1; const key = String(record.student); const value = stats.get(key) || { present: 0, absent: 0, leave: 0 }; value[record.status] += 1; stats.set(key, value); });
    const percent = (value) => { const total = value.present + value.absent + value.leave; return total ? Number(((value.present / total) * 100).toFixed(1)) : 0; };
    const studentRows = students.map((student) => { const value = stats.get(String(student._id)) || { present: 0, absent: 0, leave: 0 }; return { id: student._id, name: student.userId?.name || "Unknown", rollNumber: student.rollNumber, year: student.year, semester: student.semester, ...value, percentage: percent(value) }; }).sort((a, b) => a.percentage - b.percentage);
    res.json({ range: { from, to }, totals: { ...totals, percentage: percent(totals) }, students: studentRows, lowAttendance: studentRows.filter((student) => student.percentage < 75).slice(0, 20) });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

async function submitFees(req, res) {
  try {
    const profile = await teacherProfileModel.findOne({ userId: req.user.id });
    const { studentId } = req.params;
    const { session, status = "paid" } = req.body;
    const student = await studentProfileModel.findOne({
      _id: studentId,
      department: profile?.department,
    });
    if (!profile || !student)
      return res
        .status(403)
        .json({ message: "Student is outside your department" });
    const fee = await feesModel.findOneAndUpdate(
      { studentId, session },
      { $set: { status } },
      { new: true, upsert: true },
    );
    res.status(200).json({ message: "Fee status updated", fee });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  updateTeacherDetails,
  addSubject,
  getSubjects,
  getSubjectDetails,
  getStudentFees,
  submitFees,
  getHodTimetable,
  getHodAttendanceAnalytics,
  getHodProfile,
  updateHodProfile,
};
