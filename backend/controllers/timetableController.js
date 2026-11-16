import Timetable from '../models/Timetable.js';
import Subject from '../models/Subject.js';

// Helper to convert "HH:MM" into minutes from midnight
const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Check if two intervals overlap
const isOverlapping = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && e1 > s2;
};

// @desc    Get complete weekly timetable & today's schedule
// @route   GET /api/timetable
// @access  Private
export const getTimetable = async (req, res) => {
  try {
    const entries = await Timetable.find({ userId: req.user._id })
      .populate('subjectId', 'name code facultyName color')
      .sort({ startTime: 1 });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weeklyGrid = {};
    days.forEach((day) => {
      weeklyGrid[day] = [];
    });

    entries.forEach((item) => {
      if (weeklyGrid[item.day]) {
        weeklyGrid[item.day].push(item);
      }
    });

    // Identify today's day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[new Date().getDay()];
    const todayClasses = weeklyGrid[currentDayName] || [];

    return res.status(200).json({
      success: true,
      currentDay: currentDayName,
      totalEntries: entries.length,
      todayClasses,
      weeklyGrid,
      entries
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching timetable'
    });
  }
};

// @desc    Create timetable entry with overlap validation
// @route   POST /api/timetable
// @access  Private
export const createTimetableEntry = async (req, res) => {
  try {
    const { subjectId, day, classroom, startTime, endTime, note } = req.body;

    if (!subjectId || !day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject, day, start time, and end time'
      });
    }

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time'
      });
    }

    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject not found or does not belong to you'
      });
    }

    // Overlap conflict detection
    const existingEntries = await Timetable.find({
      userId: req.user._id,
      day
    }).populate('subjectId', 'name code');

    const conflict = existingEntries.find((entry) =>
      isOverlapping(startTime, endTime, entry.startTime, entry.endTime)
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Schedule conflict detected! ${conflict.subjectId?.name || 'Another class'} is already scheduled on ${day} from ${conflict.startTime} to ${conflict.endTime}`
      });
    }

    const newEntry = await Timetable.create({
      userId: req.user._id,
      subjectId,
      day,
      classroom: classroom || 'Room 101',
      startTime,
      endTime,
      note: note || ''
    });

    const populated = await newEntry.populate('subjectId', 'name code facultyName color');

    return res.status(201).json({
      success: true,
      message: 'Timetable class scheduled successfully',
      entry: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating timetable entry'
    });
  }
};

// @desc    Update timetable entry with overlap validation
// @route   PUT /api/timetable/:id
// @access  Private
export const updateTimetableEntry = async (req, res) => {
  try {
    const entry = await Timetable.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    const { subjectId, day, classroom, startTime, endTime, note } = req.body;

    const targetDay = day || entry.day;
    const targetStart = startTime || entry.startTime;
    const targetEnd = endTime || entry.endTime;

    if (timeToMinutes(targetStart) >= timeToMinutes(targetEnd)) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time'
      });
    }

    if (subjectId) {
      const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
      if (!subject) {
        return res.status(400).json({
          success: false,
          message: 'Subject does not belong to you'
        });
      }
      entry.subjectId = subjectId;
    }

    // Check overlap with other entries (excluding this one)
    const otherEntries = await Timetable.find({
      userId: req.user._id,
      day: targetDay,
      _id: { $ne: entry._id }
    }).populate('subjectId', 'name code');

    const conflict = otherEntries.find((other) =>
      isOverlapping(targetStart, targetEnd, other.startTime, other.endTime)
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Schedule conflict: ${conflict.subjectId?.name || 'Class'} is already scheduled on ${targetDay} from ${conflict.startTime} to ${conflict.endTime}`
      });
    }

    entry.day = targetDay;
    entry.startTime = targetStart;
    entry.endTime = targetEnd;
    if (classroom !== undefined) entry.classroom = classroom;
    if (note !== undefined) entry.note = note;

    const updated = await entry.save();
    const populated = await updated.populate('subjectId', 'name code facultyName color');

    return res.status(200).json({
      success: true,
      message: 'Timetable entry updated successfully',
      entry: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating timetable entry'
    });
  }
};

// @desc    Delete timetable entry
// @route   DELETE /api/timetable/:id
// @access  Private
export const deleteTimetableEntry = async (req, res) => {
  try {
    const entry = await Timetable.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    await Timetable.deleteOne({ _id: entry._id });

    return res.status(200).json({
      success: true,
      message: 'Timetable entry deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting timetable entry'
    });
  }
};
