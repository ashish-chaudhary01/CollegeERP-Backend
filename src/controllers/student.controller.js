import feesModel from "../models/fees.model.js";
import studentProfileModel from "../models/studentProfile.model.js";
import subjectModel from "../models/subject.model.js";
import studentAttendanceModel from "../models/studentAttendance.model.js";
import teacherProfileModel from "../models/teacherProfile.model.js";

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

    const assignedTeacher = subject.teacherId
      ? await teacherProfileModel
          .findById(subject.teacherId)
          .populate({ path: "userId", select: "name" })
      : null;

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

async function getStudentAttendance(req, res) {
  try {
    const student = await studentProfileModel.findOne({ userId: req.user.id });
    if (!student)
      return res.status(404).json({ message: "student Profile Not Found" });
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
};
