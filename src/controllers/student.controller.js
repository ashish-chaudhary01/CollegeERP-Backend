import feesModel from "../models/fees.model.js";
import studentProfileModel from "../models/studentProfile.model.js";
import subjectModel from "../models/subject.model.js";
import studentAttendanceModel from "../models/studentAttendance.model.js";
import teacherProfileModel from "../models/teacherProfile.model.js";
import userModel from "../models/user.model.js";
import timetableModel from "../models/timetable.model.js";

// get student dashboard
async function studentDashboard(req, res) {
  try {
    const userId = req.user.id;
    const student = await studentProfileModel.findOne({ userId }).populate([
      { path: "userId", select: "name email role status" },
      { path: "department", select: "departmentName departmentCode" },
    ]);

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const departmentId = student.department?._id || student.department;

    // Subjects for student's department, year, semester
    const subjects = await subjectModel
      .find({
        departmentId,
        year: student.year,
        semester: student.semester,
      })
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email" },
      })
      .lean();

    const subjectIds = subjects.map((s) => s._id);

    // Full timetable for enrolled subjects
    const timetable = await timetableModel
      .find({ subject: { $in: subjectIds } })
      .populate({
        path: "subject",
        select: "subjectName subjectCode year semester teacherId",
        populate: {
          path: "teacherId",
          populate: { path: "userId", select: "name email" },
        },
      })
      .sort({ startTime: 1 })
      .lean();

    // Determine today's classes
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = days[new Date().getDay()];
    const todayClasses = timetable.filter(
      (slot) => (slot.day || "").toLowerCase() === today,
    );

    // Attendance summary
    const attendanceRecords = await studentAttendanceModel
      .find({ student: student._id })
      .populate("subject", "subjectName subjectCode")
      .sort({ date: -1 })
      .lean();

    const present = attendanceRecords.filter(
      (r) => r.status === "present",
    ).length;
    const absent = attendanceRecords.filter(
      (r) => r.status === "absent",
    ).length;
    const leave = attendanceRecords.filter((r) => r.status === "leave").length;
    const total = present + absent + leave;
    const percentage = total ? Number(((present / total) * 100).toFixed(1)) : 0;

    // Subject-wise attendance calculation
    const subjectAttendanceMap = new Map();
    subjects.forEach((subj) => {
      subjectAttendanceMap.set(String(subj._id), {
        subject: subj,
        present: 0,
        absent: 0,
        leave: 0,
        total: 0,
        percentage: 0,
      });
    });

    attendanceRecords.forEach((record) => {
      const key = String(record.subject?._id || record.subject);
      if (subjectAttendanceMap.has(key)) {
        const item = subjectAttendanceMap.get(key);
        if (record.status === "present") item.present += 1;
        if (record.status === "absent") item.absent += 1;
        if (record.status === "leave") item.leave += 1;
        item.total += 1;
      }
    });

    const subjectAttendance = Array.from(subjectAttendanceMap.values()).map(
      (item) => ({
        ...item,
        percentage: item.total
          ? Number(((item.present / item.total) * 100).toFixed(1))
          : 0,
      }),
    );

    // Fees summary
    const fees = await feesModel
      .find({ studentId: student._id })
      .sort({ session: -1 })
      .lean();

    res.status(200).json({
      profile: student,
      subjects,
      todayClasses,
      totalClassesToday: todayClasses.length,
      weeklyScheduleCount: timetable.length,
      timetable,
      attendance: {
        present,
        absent,
        leave,
        total,
        percentage,
        bySubject: subjectAttendance,
        recentRecords: attendanceRecords.slice(0, 5),
      },
      fees,
    });
  } catch (error) {
    console.error("Error in studentDashboard:", error.message);
    res.status(500).json({ message: error.message });
  }
}

//get student profile
async function studentProfile(req, res) {
  try {
    const userId = req.user.id;
    const student = await studentProfileModel
      .findOne({ userId: userId })
      .populate([
        { path: "userId", select: "name email role status" },
        { path: "department" },
      ]);

    if (!student) return res.status(404).json({ message: "No student found" });

    const fees = await feesModel
      .find({ studentId: student._id })
      .sort({ session: -1 });
    const attendanceRecords = await studentAttendanceModel
      .find({ student: student._id })
      .lean();
    const present = attendanceRecords.filter(
      (record) => record.status === "present",
    ).length;
    const total = attendanceRecords.filter((record) =>
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
    console.error("Error in studentProfile:", error.message);
    res.status(500).json({ message: error.message });
  }
}

async function updateStudentProfile(req, res) {
  try {
    const {
      name,
      email,
      phoneNumber,
      address,
      profilePictureUrl,
      fatherName,
      rollNumber,
    } = req.body;
    const user = await userModel
      .findByIdAndUpdate(
        req.user.id,
        { name, email },
        { new: true, runValidators: true },
      )
      .select("-password");
    const student = await studentProfileModel
      .findOneAndUpdate(
        { userId: req.user.id },
        { phoneNumber, address, profilePictureUrl, fatherName, rollNumber },
        { new: true, runValidators: true },
      )
      .populate([
        { path: "userId", select: "name email role status" },
        { path: "department", select: "departmentName departmentCode" },
      ]);
    if (!user || !student)
      return res.status(404).json({ message: "Student profile not found" });
    res.json({ user, student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// get student subjects
async function getStudentSubjects(req, res) {
  try {
    const userId = req.user.id;
    const student = await studentProfileModel.findOne({ userId });

    if (!student) {
      return res.status(404).json({ message: "Student Profile Not Found" });
    }

    const studentSubjects = await subjectModel
      .find({
        departmentId: student.department,
        year: student.year,
        semester: student.semester,
      })
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email" },
      });

    res.status(200).json({ studentSubjects });
  } catch (error) {
    console.error("Error in getStudentSubjects:", error.message);
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
    console.error("Error in fetching subject details:", error.message);
    res.status(500).json({ message: error.message });
  }
}

// get student fees details
async function getStudentFees(req, res) {
  try {
    const userId = req.user.id;
    const student = await studentProfileModel
      .findOne({ userId })
      .populate({ path: "userId", select: "name email" })
      .populate({
        path: "department",
        select: "departmentName departmentCode",
      });

    if (!student) {
      return res.status(404).json({ message: "Student Profile Not Found" });
    }

    const studentFees = await feesModel
      .find({ studentId: student._id })
      .sort({ session: -1 });

    res.status(200).json({ student, studentFees });
  } catch (error) {
    console.error("Error in getStudentFees:", error.message);
    res
      .status(500)
      .json({
        message:
          error.message || "Error in student controller at getStudentFees",
      });
  }
}

async function getStudentAttendance(req, res) {
  try {
    const student = await studentProfileModel.findOne({ userId: req.user.id });
    if (!student)
      return res.status(404).json({ message: "Student Profile Not Found" });
    const records = await studentAttendanceModel
      .find({ student: student._id })
      .populate("subject", "subjectName subjectCode")
      .sort({ date: -1 })
      .lean();
    const grouped = new Map();
    records.forEach((record) => {
      const key = String(record.subject?._id);
      if (!grouped.has(key))
        grouped.set(key, {
          subject: record.subject,
          present: 0,
          absent: 0,
          leave: 0,
          records: [],
        });
      const row = grouped.get(key);
      row[record.status] += 1;
      row.records.push({ date: record.date, status: record.status });
    });
    const attendance = [...grouped.values()].map((row) => ({
      ...row,
      percentage: Number(
        (
          (row.present / (row.present + row.absent + row.leave)) * 100 || 0
        ).toFixed(1),
      ),
    }));
    res.json({ attendance });
  } catch (error) {
    console.error("Error in getStudentAttendance:", error.message);
    res.status(500).json({ message: error.message });
  }
}

async function getStudentTimetable(req, res) {
  try {
    const student = await studentProfileModel.findOne({ userId: req.user.id });
    if (!student)
      return res.status(404).json({ message: "Student profile not found" });

    const subjects = await subjectModel
      .find({
        departmentId: student.department,
        year: student.year,
        semester: student.semester,
      })
      .select("_id");

    const timetable = await timetableModel
      .find({ subject: { $in: subjects.map((subject) => subject._id) } })
      .populate({
        path: "subject",
        select: "subjectName subjectCode year semester teacherId",
        populate: {
          path: "teacherId",
          populate: { path: "userId", select: "name email" },
        },
      })
      .sort({ day: 1, startTime: 1 });

    res.json({ timetable });
  } catch (error) {
    console.error("Error in getStudentTimetable:", error.message);
    res.status(500).json({ message: error.message });
  }
}

export default {
  studentDashboard,
  studentProfile,
  getStudentSubjects,
  getSubjectDetails,
  getStudentFees,
  getStudentAttendance,
  getStudentTimetable,
  updateStudentProfile,
};
