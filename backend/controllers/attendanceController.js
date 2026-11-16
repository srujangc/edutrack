import Attendance from '../models/Attendance.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';

// Helper to compute attendance stats
const calculateStats = (records, targetPercentage = 75) => {
  const total = records.length;
  const attended = records.filter((r) => r.status === 'Present').length;
  const absent = records.filter((r) => r.status === 'Absent').length;
  const excused = records.filter((r) => r.status === 'Excused').length;
  
  // Percentage based on attended / total (excused can either be counted in total or neutral)
  // Standard academic policy: Attendance % = (attended / total) * 100
  const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;

  const target = Number(targetPercentage);
  let classesNeeded = 0;
  let safeToMiss = 0;

  if (target > 0 && target < 100) {
    if (percentage < target) {
      // (attended + x) / (total + x) >= target / 100
      // 100*(attended + x) >= target*(total + x)
      // x * (100 - target) >= target * total - 100 * attended
      const num = target * total - 100 * attended;
      const den = 100 - target;
      classesNeeded = Math.max(0, Math.ceil(num / den));
    } else {
      // Safe to miss: attended / (total + y) >= target / 100
      // 100 * attended >= target * total + target * y
      // y <= (100 * attended - target * total) / target
      const safe = Math.floor((100 * attended - target * total) / target);
      safeToMiss = Math.max(0, safe);
    }
  }

  const isLow = percentage < target;

  return {
    total,
    attended,
    absent,
    excused,
    percentage,
    target,
    classesNeeded,
    safeToMiss,
    isLow
  };
};

// @desc    Get complete attendance summary across all subjects
// @route   GET /api/attendance
// @access  Private
export const getAttendanceOverview = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const target = user?.targetAttendance || 75;

    const subjects = await Subject.find({ userId: req.user._id }).sort({ code: 1 });
    const allRecords = await Attendance.find({ userId: req.user._id }).sort({ date: -1 });

    const subjectStats = subjects.map((subj) => {
      const records = allRecords.filter(
        (r) => r.subjectId.toString() === subj._id.toString()
      );
      const stats = calculateStats(records, target);
      return {
        subject: subj,
        stats,
        recentLogs: records.slice(0, 5)
      };
    });

    const overallStats = calculateStats(allRecords, target);

    return res.status(200).json({
      success: true,
      target,
      overallStats,
      subjects: subjectStats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching attendance overview'
    });
  }
};

// @desc    Get attendance history logs for a subject or all
// @route   GET /api/attendance/logs
// @access  Private
export const getAttendanceLogs = async (req, res) => {
  try {
    const { subjectId, status, limit } = req.query;
    let query = { userId: req.user._id };

    if (subjectId && subjectId !== 'all') {
      query.subjectId = subjectId;
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    const logsQuery = Attendance.find(query)
      .populate('subjectId', 'name code color')
      .sort({ date: -1, createdAt: -1 });

    if (limit) {
      logsQuery.limit(Number(limit));
    }

    const logs = await logsQuery;

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching attendance logs'
    });
  }
};

// @desc    Record single attendance entry
// @route   POST /api/attendance
// @access  Private
export const recordAttendance = async (req, res) => {
  try {
    const { subjectId, date, status, note } = req.body;

    if (!subjectId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject and attendance status'
      });
    }

    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject not found or does not belong to you'
      });
    }

    const record = await Attendance.create({
      userId: req.user._id,
      subjectId,
      date: date ? new Date(date) : new Date(),
      status,
      note: note || ''
    });

    const populated = await record.populate('subjectId', 'name code color');

    return res.status(201).json({
      success: true,
      message: `Marked as ${status}`,
      attendance: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error recording attendance'
    });
  }
};

// @desc    Update an attendance entry
// @route   PUT /api/attendance/:id
// @access  Private
export const updateAttendance = async (req, res) => {
  try {
    const record = await Attendance.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    const { status, date, note } = req.body;
    if (status) record.status = status;
    if (date) record.date = new Date(date);
    if (note !== undefined) record.note = note;

    const updated = await record.save();
    const populated = await updated.populate('subjectId', 'name code color');

    return res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      attendance: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating attendance'
    });
  }
};

// @desc    Delete an attendance entry
// @route   DELETE /api/attendance/:id
// @access  Private
export const deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await Attendance.deleteOne({ _id: record._id });

    return res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting attendance record'
    });
  }
};
