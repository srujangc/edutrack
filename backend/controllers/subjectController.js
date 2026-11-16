import Subject from '../models/Subject.js';
import Assignment from '../models/Assignment.js';
import Attendance from '../models/Attendance.js';
import Exam from '../models/Exam.js';
import Note from '../models/Note.js';
import Timetable from '../models/Timetable.js';

// @desc    Get all subjects for the logged-in student
// @route   GET /api/subjects
// @access  Private
export const getSubjects = async (req, res) => {
  try {
    const { search, semester } = req.query;
    let query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { facultyName: { $regex: search, $options: 'i' } }
      ];
    }

    if (semester && semester !== 'all') {
      query.semester = semester;
    }

    const subjects = await Subject.find(query).sort({ code: 1 });

    // Also get quick stats for each subject
    const subjectListWithStats = await Promise.all(
      subjects.map(async (subj) => {
        const [totalAssignments, pendingAssignments, attendanceRecords, upcomingExams] = await Promise.all([
          Assignment.countDocuments({ userId: req.user._id, subjectId: subj._id }),
          Assignment.countDocuments({ userId: req.user._id, subjectId: subj._id, status: 'Pending' }),
          Attendance.find({ userId: req.user._id, subjectId: subj._id }),
          Exam.countDocuments({ userId: req.user._id, subjectId: subj._id, isCompleted: false })
        ]);

        const totalClasses = attendanceRecords.length;
        const attendedClasses = attendanceRecords.filter((a) => a.status === 'Present').length;
        const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

        return {
          ...subj.toObject(),
          stats: {
            totalAssignments,
            pendingAssignments,
            totalClasses,
            attendedClasses,
            attendancePercentage,
            upcomingExams
          }
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: subjectListWithStats.length,
      subjects: subjectListWithStats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching subjects'
    });
  }
};

// @desc    Get single subject with its related assignments, attendance, exams, notes, timetable
// @route   GET /api/subjects/:id
// @access  Private
export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or does not belong to you'
      });
    }

    const [assignments, attendanceLogs, exams, notes, timetable] = await Promise.all([
      Assignment.find({ userId: req.user._id, subjectId: subject._id }).sort({ dueDate: 1 }),
      Attendance.find({ userId: req.user._id, subjectId: subject._id }).sort({ date: -1 }),
      Exam.find({ userId: req.user._id, subjectId: subject._id }).sort({ examDate: 1 }),
      Note.find({ userId: req.user._id, subjectId: subject._id }).sort({ updatedAt: -1 }),
      Timetable.find({ userId: req.user._id, subjectId: subject._id }).sort({ startTime: 1 })
    ]);

    const totalClasses = attendanceLogs.length;
    const attendedClasses = attendanceLogs.filter((a) => a.status === 'Present').length;
    const absentClasses = attendanceLogs.filter((a) => a.status === 'Absent').length;
    const excusedClasses = attendanceLogs.filter((a) => a.status === 'Excused').length;
    const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

    return res.status(200).json({
      success: true,
      subject,
      stats: {
        totalClasses,
        attendedClasses,
        absentClasses,
        excusedClasses,
        attendancePercentage
      },
      assignments,
      attendance: attendanceLogs,
      exams,
      notes,
      timetable
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching subject details'
    });
  }
};

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private
export const createSubject = async (req, res) => {
  try {
    const { name, code, semester, description, facultyName, color, credits } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject name and code'
      });
    }

    // Check duplicate code for this student
    const existing = await Subject.findOne({
      userId: req.user._id,
      code: code.trim().toUpperCase()
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Subject code "${code.toUpperCase()}" already exists in your subjects`
      });
    }

    const subject = await Subject.create({
      userId: req.user._id,
      name,
      code: code.trim().toUpperCase(),
      semester: semester || 'Semester 5',
      description: description || '',
      facultyName: facultyName || 'Faculty',
      color: color || '#3b82f6',
      credits: credits || 3
    });

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating subject'
    });
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private
export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or does not belong to you'
      });
    }

    const { name, code, semester, description, facultyName, color, credits } = req.body;

    if (code && code.trim().toUpperCase() !== subject.code) {
      const duplicate = await Subject.findOne({
        userId: req.user._id,
        code: code.trim().toUpperCase(),
        _id: { $ne: subject._id }
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Subject code "${code.toUpperCase()}" is already in use`
        });
      }
      subject.code = code.trim().toUpperCase();
    }

    if (name) subject.name = name;
    if (semester) subject.semester = semester;
    if (description !== undefined) subject.description = description;
    if (facultyName) subject.facultyName = facultyName;
    if (color) subject.color = color;
    if (credits !== undefined) subject.credits = credits;

    const updated = await subject.save();

    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      subject: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating subject'
    });
  }
};

// @desc    Delete a subject (and optionally clean up linked records)
// @route   DELETE /api/subjects/:id
// @access  Private
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or does not belong to you'
      });
    }

    await Subject.deleteOne({ _id: subject._id });

    // Cascade delete linked entities for clean data integrity
    await Promise.all([
      Assignment.deleteMany({ userId: req.user._id, subjectId: subject._id }),
      Attendance.deleteMany({ userId: req.user._id, subjectId: subject._id }),
      Exam.deleteMany({ userId: req.user._id, subjectId: subject._id }),
      Note.deleteMany({ userId: req.user._id, subjectId: subject._id }),
      Timetable.deleteMany({ userId: req.user._id, subjectId: subject._id })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Subject and associated records deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting subject'
    });
  }
};
