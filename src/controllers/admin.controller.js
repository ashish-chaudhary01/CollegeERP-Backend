import departmentModel from "../models/department.model.js";
import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import studentProfileModel from "../models/studentProfile.model.js";
import teacherProfileModel from "../models/teacherProfile.model.js";
import subjectModel from "../models/subject.model.js";
import studentAttendanceModel from "../models/studentAttendance.model.js";
import feesModel from "../models/fees.model.js";
import timetableModel from "../models/timetable.model.js";

// update profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(500).json({ message: "no user found" });
    }

    user.name = name;
    user.email = email;
    user.save();
    res.status(200).json({ message: "user updated successfully", user });
  } catch (error) {
    console.log(error.message);
  }
}

// get admin dashboard
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

    const today = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][new Date().getDay()];
    const todayClasses = await timetableModel.countDocuments({ day: today });
    const pendingFees = await feesModel.countDocuments({ status: "pending" });

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
      todayClasses,
      pendingFees,
    });
  } catch (error) {
    console.log("Error in admin dashboard", error.message);
  }
}

// create department
async function createDepartment(req, res) {
  try {
    const { departmentName, departmentCode, description } = req.body;

    const isDepartmentExist = await departmentModel.findOne({
      departmentName: departmentName,
      departmentCode: departmentCode,
    });

    if (isDepartmentExist) {
      return res.status(401).json({ message: "Department already exist" });
    }
    if (departmentName && departmentCode) {
      const department = await departmentModel.create({
        departmentName,
        departmentCode,
        description,
      });

      res
        .status(201)
        .json({ message: "Department Successfully created!", department });
    }
  } catch (error) {
    console.log(error.message);
  }
}

// get department
async function getAllDepartment(req, res) {
  const departments = await departmentModel.find().populate({
    path: "hod",
    populate: { path: "userId", select: "name email" },
  });
  const departmentStats = await Promise.all(
    departments.map(async (department) => ({
      ...department.toObject(),
      studentCount: await studentProfileModel.countDocuments({
        department: department._id,
      }),
      teacherCount: await teacherProfileModel.countDocuments({
        department: department._id,
      }),
      activeTeacherCount: await teacherProfileModel.countDocuments({
        department: department._id,
        status: "active",
      }),
    })),
  );

  res.status(200).json({
    departments: departmentStats,
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
  try {
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
    if (String(teacher.department) !== String(departmentId)) {
      return res
        .status(400)
        .json({ message: "HOD must belong to this department" });
    }

    const previousHod = await teacherProfileModel.findById(department.hod);

    // find previous hod and demote it to teacher
    if (previousHod) {
      await userModel.findByIdAndUpdate(previousHod.userId, {
        role: "teacher",
      });
    }

    // assigning new hod
    department.hod = teacher._id;
    await department.save();

    // find and update user(teacher) to hod
    await userModel.findByIdAndUpdate(teacher.userId, { role: "hod" });

    return res.status(200).json({
      message: "HOD assigned successfully",
    });
  } catch (error) {
    console.log(error.message);
  }
}

// create student
async function createStudent(req, res) {
  try {
    const {
      name,
      email,
      rollNumber,
      password,
      semester,
      year,
      department,
      academicSession,
      addharCardNumber,
      phoneNumber,
    } = req.body;

    if (
      !name &&
      !email &&
      !rollNumber &&
      !password &&
      !semester &&
      !year &&
      !department &&
      !academicSession &&
      !addharCardNumber &&
      !phoneNumber
    ) {
      return res.status(500).json({ message: "all fields are required" });
    }

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
      addharCardNumber: addharCardNumber,
    });

    // create his fees model
    const fees = await feesModel.create({
      studentId: studentProfile._id,
      status: "pending",
      session: "null",
    });

    res.status(201).json({
      message: "Student created successfully",
      user,
      studentProfile,
    });
  } catch (error) {
    console.log(error.message);
  }
}

// delete student
async function deleteStudent(req, res) {
  try {
    const { studentId } = req.params;
    const student = await studentProfileModel.findByIdAndDelete(studentId);

    if (!student) return res.status(404).json({ message: "No student found" });
    const user = await userModel.findByIdAndDelete(student.userId);

    res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "student not deleted" });
  }
}

//get all student
async function getAllStudent(req, res) {
  try {
    const { departmentId, status, year, semester } = req.query;

    const filter = {};

    if (departmentId && departmentId !== "all") {
      filter.department = departmentId;
    }
    if (status && status !== "all") {
      filter.status = status;
    }
    if (year && year !== "all") {
      filter.year = year;
    }
    if (semester && semester !== "all") {
      filter.semester = semester;
    }

    const students = await studentProfileModel.find(filter).populate([
      { path: "department", select: "departmentName departmentCode" },
      { path: "userId", select: "-password" },
    ]);

    res.status(200).json({ students });
  } catch (error) {
    console.log(error.message);
  }
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

    if (!student) return res.status(404).json({ message: "No student found" });

    const fees = await feesModel
      .find({ studentId: studentId })
      .sort({ session: -1 });
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
      fees,
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

async function updateStudentDetails(req, res) {
  try {
    const { studentId } = req.params;
    const {
      name,
      email,
      rollNumber,
      year,
      semester,
      academicSession,
      phoneNumber,
      address,
      fatherName,
      profilePictureUrl,
      status,
      department,
    } = req.body;
    const student = await studentProfileModel.findByIdAndUpdate(
      studentId,
      {
        rollNumber,
        year,
        semester,
        academicSession,
        phoneNumber,
        address,
        fatherName,
        profilePictureUrl,
        status,
        department,
      },
      { new: true, runValidators: true },
    );
    if (!student) return res.status(404).json({ message: "Student not found" });
    await userModel.findByIdAndUpdate(
      student.userId,
      { name, email },
      { runValidators: true },
    );
    res.json({ message: "Student details updated", student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// create teacher
async function createTeacher(req, res) {
  try {
    const { name, email, password, department, phoneNumber } = req.body;

    if (!name && !email && !password && !department && !phoneNumber) {
      return res.status(500).json({ message: "all fields are required" });
    }

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
  } catch (error) {
    console.log(error.message);
  }
}

// get all teacher
async function getAllTeacher(req, res) {
  try {
    const { departmentId, status } = req.query;
    const filter = {};
    if (departmentId && departmentId !== "all") {
      filter.department = departmentId;
    }
    if (status && status !== "all") {
      filter.status = status;
    }
    const teacher = await teacherProfileModel
      .find(filter)
      .populate({ path: "department" })
      .populate({ path: "userId", select: "-password" });

    res.status(200).json({ teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const subjects = await subjectModel.find({ teacherId: teacherId });

    res.status(200).json({ teacher, subjects });
  } catch (error) {
    console.log("Error in fetching teacher details", error.message);
  }
}

// update teacher
async function updateTeacherDetails(req, res) {
  try {
    const { teacherId } = req.params;
    const {
      name,
      email,
      phoneNumber,
      address,
      designation,
      profilePictureUrl,
      status,
      department,
    } = req.body;
    const teacher = await teacherProfileModel
      .findByIdAndUpdate(
        teacherId,
        {
          phoneNumber,
          address,
          designation,
          profilePictureUrl,
          status,
          department,
        },
        { new: true, runValidators: true },
      )
      .populate([
        { path: "userId", select: "name email role status" },
        { path: "department" },
      ]);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
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

// delete teacher
async function deleteTeacher(req, res) {
  try {
    const { teacherId } = req.params;
    const teacher = await teacherProfileModel.findByIdAndDelete(teacherId);

    if (!teacher) return res.status(404).json({ message: "No Teacher found" });
    const user = await userModel.findByIdAndDelete(teacher.userId);

    res.status(200).json({
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Teacher not deleted" });
  }
}

// create subject
async function createSubject(req, res) {
  try {
    const { subjectName, departmentId, subjectCode, semester, year } = req.body;

    if (!subjectName && !departmentId && !subjectCode && !semester && !year) {
      return res.status(500).json({ message: "All fields are reuquired" });
    }

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
  }
}

// get all subject
async function getAllSubjects(req, res) {
  const subjectsData = await subjectModel
    .find()
    .populate({
      path: "departmentId",
      select: "departmentCode",
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
    department: subject.departmentId?.departmentCode,
    departmentId: subject.departmentId?._id,
    teacherName: subject.teacherId?.userId?.name || "Assign Teacher",
  }));

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

async function updateSubject(req, res) {
  try {
    const { subjectId } = req.params;
    const { subjectName, departmentId, subjectCode, semester, year } = req.body;

    const subject = await subjectModel.findById(subjectId);

    if (!subject) {
      return res.status(500).json({ message: "no subject found" });
    }

    if (!subjectName && !departmentId && !subjectCode && !semester && !year) {
      return res.status(500).json({ message: "All fields are reuquired" });
    }

    subject.subjectName = subjectName;
    subject.subjectCode = subjectCode;
    subject.departmentId = departmentId;
    subject.year = year;
    subject.semester = semester;

    subject.save();

    res.status(201).json({ message: "Subject updated successfully" });
  } catch (error) {
    console.log(error.message);
  }
}

// assign subject to teacher
async function assignSubject(req, res) {
  try {
    const { subjectId } = req.params;
    const { teacherId } = req.body;

    const subject = await subjectModel.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "No subject Found" });
    }

    subject.teacherId = teacherId;
    subject.save();

    res.status(201).json({ message: "Subject assigned successfully" });
  } catch (error) {
    console.log(error.message);
  }
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

async function getTimetable(req, res) {
  try {
    const filter = {};
    if (req.query.department && req.query.department !== "all")
      filter.departmentId = req.query.department;
    if (req.query.semester && req.query.semester !== "all")
      filter.semester = Number(req.query.semester);
    const subjects = await subjectModel.find(filter).select("_id");
    const timetableFilter = {
      subject: { $in: subjects.map((subject) => subject._id) },
    };
    if (req.query.day && req.query.day !== "all")
      timetableFilter.day = req.query.day;
    const timetable = await timetableModel
      .find(timetableFilter)
      .populate({
        path: "subject",
        select: "subjectName subjectCode year semester",
        populate: {
          path: "departmentId",
          select: "departmentName departmentCode",
        },
      })
      .sort({ day: 1, startTime: 1 });
    res.json({ timetable });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createTimetable(req, res) {
  try {
    const { subjectId, day, startTime, endTime } = req.body;
    if (!subjectId || !day || !startTime || !endTime || startTime >= endTime)
      return res
        .status(400)
        .json({ message: "Valid subject, day and time range are required" });
    const subject = await subjectModel.findById(subjectId);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    if (subject.semester > 6)
      return res
        .status(400)
        .json({ message: "Timetable supports semesters 1 through 6 only" });
    const timetable = await timetableModel.create({
      subject: subject._id,
      day,
      startTime,
      endTime,
    });
    await timetable.populate({
      path: "subject",
      populate: {
        path: "departmentId",
        select: "departmentName departmentCode",
      },
    });
    res.status(201).json({ message: "Timetable slot added", timetable });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 500).json({
      message:
        error.code === 11000
          ? "This subject already has a slot at that day and time"
          : error.message,
    });
  }
}

async function deleteTimetable(req, res) {
  try {
    const deleted = await timetableModel.findByIdAndDelete(
      req.params.timetableId,
    );
    if (!deleted)
      return res.status(404).json({ message: "Timetable slot not found" });
    res.json({ message: "Timetable slot removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getAttendanceAnalytics(req, res) {
  try {
    const currentYear = new Date().getFullYear();
    const { department, from, to } = req.query;
    const startDate = from || `${currentYear}-01-01`;
    const endDate = to || `${currentYear}-12-31`;
    const studentFilter =
      department && department !== "all" ? { department } : {};
    const students = await studentProfileModel
      .find(studentFilter)
      .populate("userId", "name email")
      .populate("department", "departmentName departmentCode")
      .lean();
    const studentIds = students.map((student) => student._id);
    const records = await studentAttendanceModel
      .find({
        student: { $in: studentIds },
        date: { $gte: startDate, $lte: endDate },
      })
      .populate("subject", "subjectName subjectCode")
      .lean();

    const byStudent = new Map();
    const byDepartment = new Map();
    const byDate = new Map();
    const bySubject = new Map();
    const addBucket = (bucket, key) => {
      if (!bucket.has(String(key)))
        bucket.set(String(key), { present: 0, absent: 0, leave: 0 });
      return bucket.get(String(key));
    };
    records.forEach((record) => {
      const student = students.find(
        (item) => String(item._id) === String(record.student),
      );
      if (!student) return;
      [
        addBucket(byStudent, student._id),
        addBucket(byDepartment, student.department?._id || "unknown"),
        addBucket(byDate, record.date),
        addBucket(bySubject, record.subject?._id || "unknown"),
      ].forEach((bucket) => {
        bucket[record.status] += 1;
      });
    });
    const percentage = (bucket) => {
      const total = bucket.present + bucket.absent + bucket.leave;
      return total ? Number(((bucket.present / total) * 100).toFixed(1)) : 0;
    };
    const studentRows = students
      .map((student) => {
        const stats = byStudent.get(String(student._id)) || {
          present: 0,
          absent: 0,
          leave: 0,
        };
        return {
          id: student._id,
          name: student.userId?.name || "Unknown",
          rollNumber: student.rollNumber,
          department:
            student.department?.departmentCode ||
            student.department?.departmentName ||
            "-",
          ...stats,
          percentage: percentage(stats),
        };
      })
      .sort((a, b) => a.percentage - b.percentage);
    const departmentRows = students.reduce((rows, student) => {
      const id = String(student.department?._id || "unknown");
      const stats = byDepartment.get(id) || { present: 0, absent: 0, leave: 0 };
      if (!rows.some((row) => row.id === id))
        rows.push({
          id,
          name:
            student.department?.departmentCode ||
            student.department?.departmentName ||
            "Unknown",
          ...stats,
          percentage: percentage(stats),
        });
      return rows;
    }, []);
    const subjectRows = [...bySubject.entries()].map(([id, stats]) => {
      const subject = records.find(
        (record) => String(record.subject?._id) === id,
      )?.subject;
      return {
        id,
        name: subject?.subjectCode || subject?.subjectName || "Unknown",
        ...stats,
        percentage: percentage(stats),
      };
    });
    const dailyRows = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, stats]) => ({
        date,
        ...stats,
        percentage: percentage(stats),
      }));
    const totals = records.reduce(
      (sum, record) => {
        sum[record.status] += 1;
        return sum;
      },
      { present: 0, absent: 0, leave: 0 },
    );
    res.status(200).json({
      range: { from: startDate, to: endDate },
      totals: { ...totals, percentage: percentage(totals) },
      departments: departmentRows,
      subjects: subjectRows,
      daily: dailyRows,
      students: studentRows,
      lowAttendance: studentRows
        .filter((student) => student.percentage < 75)
        .slice(0, 20),
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to load attendance analytics",
      error: error.message,
    });
  }
}

// get fees of students
async function getFees(req, res) {
  try {
    const { department, semester, feeStatus, status } = req.query;
    const session =
      req.query.session ||
      `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`;

    const studentFilter = {};

    if (semester && semester !== "all") {
      studentFilter.semester = Number(semester);
    }

    if (department && department !== "all") {
      const departmentData = await departmentModel.findOne({
        _id: department,
      });

      if (!departmentData) {
        return res.status(200).json([]);
      }

      studentFilter.department = departmentData._id;
    }
    if (status && status != "all") {
      studentFilter.status = status;
    }

    const students = await studentProfileModel.find(studentFilter).populate([
      { path: "userId", select: "name email" },
      { path: "department", select: "departmentName departmentCode" },
    ]);
    const feesData = await feesModel.find({
      session,
      studentId: { $in: students.map((student) => student._id) },
    });
    const feeByStudent = new Map(
      feesData.map((fee) => [String(fee.studentId), fee]),
    );
    const result = students
      .map((student) => ({
        id: student._id,
        status: feeByStudent.get(String(student._id))?.status || "pending",
        studentName: student.userId?.name || "Unknown",
        studentRollNumber: student.rollNumber,
        email: student.userId?.email,
        semester: student.semester,
        year: student.year,
        session,
        departmentName: student.department?.departmentCode,
      }))
      .filter(
        (fee) => feeStatus === "all" || !feeStatus || fee.status === feeStatus,
      );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function submitFees(req, res) {
  try {
    const { studentId } = req.query;
    const { session, status } = req.body;

    const fees = await feesModel.findOneAndUpdate(
      { studentId, session },
      { $set: { status } },
      { new: true, upsert: true },
    );

    res.status(201).json({ message: "Fees submitted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "failed to submit fees" });
  }
}

export default {
  updateProfile,
  assignHod,
  getAdminDashboard,
  adminSearch,
  createDepartment,
  getAllDepartment,
  getDepartmentDetails,
  createStudent,
  getAllStudent,
  deleteStudent,
  getStudentDetails,
  updateStudentDetails,
  createTeacher,
  getAllTeacher,
  getTeacherDetails,
  deleteTeacher,
  updateTeacherDetails,
  createSubject,
  getAllSubjects,
  getAttendanceAnalytics,
  getTimetable,
  createTimetable,
  deleteTimetable,
  assignSubject,
  getSubjectDetails,
  getFees,
  updateSubject,
  submitFees,
};
