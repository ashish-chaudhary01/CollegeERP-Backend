import feesModel from "../models/fees.model.js";
import studentProfileModel from "../models/studentProfile.model.js";
import subjectModel from "../models/subject.model.js";
import teacherProfileModel from "../models/teacherProfile.model.js";
import studentAttendanceModel from "../models/studentAttendance.model.js";
import timetableModel from "../models/timetable.model.js";

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
async function teacherDashboard(req, res) {
  try {
    const profile = await teacherProfileModel
      .findOne({ userId: req.user.id })
      .populate("userId", "name email")
      .populate("department", "departmentName departmentCode");
    if (!profile)
      return res.status(404).json({ message: "Teacher profile not found" });
    const subjects = await subjectModel
      .find({ teacherId: profile._id })
      .select("subjectName subjectCode year semester")
      .lean();
    const students = await studentProfileModel.countDocuments({
      department: profile.department?._id || profile.department,
      status: "active",
    });
    const day = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][new Date().getDay()];
    const todayClasses = await timetableModel
      .find({ subject: { $in: subjects.map((subject) => subject._id) }, day })
      .populate("subject", "subjectName subjectCode")
      .sort({ startTime: 1 })
      .lean();
    const year = new Date().getFullYear();
    const subjectIds = subjects.map((subject) => subject._id);
    const present = await studentAttendanceModel.countDocuments({
      subject: { $in: subjectIds },
      status: "present",
      date: { $regex: `^${year}` },
    });
    const absent = await studentAttendanceModel.countDocuments({
      subject: { $in: subjectIds },
      status: "absent",
      date: { $regex: `^${year}` },
    });
    res.json({
      profile,
      subjects,
      students,
      todayClasses,
      attendance: {
        present,
        absent,
        percentage:
          present + absent
            ? Number(((present / (present + absent)) * 100).toFixed(1))
            : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

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
      .populate("department", "departmentName departmentCode");

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
    const teacherSubjects = await subjectModel
      .find({ teacherId })
      .populate("departmentId", "departmentName departmentCode");

    res.status(200).json({ teacherSubjects });
  } catch (error) {
    console.log(error.message);
  }
}

async function getAttendanceRoster(req, res) {
  try {
    const profile = await teacherProfileModel.findOne({ userId: req.user.id });
    const subject = await subjectModel.findOne({
      _id: req.query.subjectId,
      teacherId: profile?._id,
    });
    if (!profile || !subject)
      return res.status(403).json({
        message: "You can only mark attendance for your assigned subject",
      });
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const students = await studentProfileModel
      .find({
        department: subject.departmentId,
        year: subject.year,
        semester: subject.semester,
        status: "active",
      })
      .populate("userId", "name")
      .lean();
    const records = await studentAttendanceModel
      .find({
        subject: subject._id,
        date,
        student: { $in: students.map((student) => student._id) },
      })
      .lean();
    const statusByStudent = new Map(
      records.map((record) => [String(record.student), record.status]),
    );
    res.json({
      subject,
      date,
      students: students.map((student) => ({
        ...student,
        attendance: statusByStudent.get(String(student._id)) || "present",
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function saveAttendance(req, res) {
  try {
    const profile = await teacherProfileModel.findOne({ userId: req.user.id });
    const { subjectId, date, attendance } = req.body;
    const subject = await subjectModel.findOne({
      _id: subjectId,
      teacherId: profile?._id,
    });
    if (!profile || !subject || !Array.isArray(attendance))
      return res
        .status(400)
        .json({ message: "Invalid subject or attendance payload" });
    const students = await studentProfileModel.find({
      _id: { $in: attendance.map((item) => item.studentId) },
      department: subject.departmentId,
      year: subject.year,
      semester: subject.semester,
    });
    const allowed = new Set(students.map((student) => String(student._id)));
    const operations = attendance
      .filter(
        (item) =>
          allowed.has(String(item.studentId)) &&
          ["present", "absent", "leave"].includes(item.status),
      )
      .map((item) => ({
        updateOne: {
          filter: { student: item.studentId, subject: subject._id, date },
          update: { $set: { status: item.status } },
          upsert: true,
        },
      }));
    if (operations.length) await studentAttendanceModel.bulkWrite(operations);
    res.json({ message: "Attendance saved", count: operations.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    //  teacher profile
    const teacherProfile = await teacherProfileModel.findOne({ userId });

    if (!teacherProfile) {
      return res.status(404).json({ message: "teacher Profile Not Found" });
    }

    // teacher department id
    const departmentId = teacherProfile.department;

    const session = req.query.session || req.params.session;
    // fess of same department students
    const fees = await feesModel.find(session ? { session } : {}).populate({
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
    res.status(200).json({ fees: fees.filter((fee) => fee.studentId) });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Error in teacher controller at getStudentFees" });
  }
}

async function getTeacherTimetable(req, res) {
  try {
    const profile = await teacherProfileModel.findOne({ userId: req.user.id });
    if (!profile)
      return res.status(404).json({ message: "Teacher profile not found" });
    const subjects = await subjectModel
      .find({ teacherId: profile._id })
      .select("_id");
    const timetable = await timetableModel
      .find({ subject: { $in: subjects.map((subject) => subject._id) } })
      .populate("subject", "subjectName subjectCode year semester")
      .sort({ day: 1, startTime: 1 });
    res.json({ timetable });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export default {
  searchStudent,
  getStudents,
  teacherDashboard,
  getStudentDetails,
  getTeacherSubject,
  getAttendanceRoster,
  saveAttendance,
  getSubjectDetails,
  getStudentFees,
  getTeacherTimetable,
};
