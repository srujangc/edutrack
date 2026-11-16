import Exam from '../models/Exam.js';
import Subject from '../models/Subject.js';

// @desc    Get all exams (upcoming and completed) with countdowns
// @route   GET /api/exams
// @access  Private
export const getExams = async (req, res) => {
  try {
    const { status, subjectId, search } = req.query;
    let query = { userId: req.user._id };

    if (subjectId && subjectId !== 'all') {
      query.subjectId = subjectId;
    }

    if (status === 'upcoming') {
      query.isCompleted = false;
    } else if (status === 'completed') {
      query.isCompleted = true;
    }

    const exams = await Exam.find(query)
      .populate('subjectId', 'name code color')
      .sort({ examDate: 1, startTime: 1 });

    const now = new Date();

    const enrichedExams = exams.map((exam) => {
      const examDateTime = new Date(exam.examDate);
      if (exam.startTime) {
        const [h, m] = exam.startTime.split(':').map(Number);
        examDateTime.setHours(h, m, 0, 0);
      }

      const diffMs = examDateTime - now;
      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;
      const isPast = diffMs < 0;

      // Grade calculation if completed and marks provided
      let percentage = null;
      let grade = null;
      if (exam.isCompleted && exam.obtainedMarks !== null && exam.maxMarks > 0) {
        percentage = Math.round((exam.obtainedMarks / exam.maxMarks) * 100);
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';
        else grade = 'F';
      }

      return {
        ...exam.toObject(),
        countdown: {
          days: Math.max(0, days),
          hours: Math.max(0, hours),
          isPast,
          diffMs
        },
        result: {
          percentage,
          grade
        }
      };
    });

    const upcoming = enrichedExams.filter((e) => !e.isCompleted);
    const completed = enrichedExams.filter((e) => e.isCompleted);

    return res.status(200).json({
      success: true,
      counts: {
        total: enrichedExams.length,
        upcoming: upcoming.length,
        completed: completed.length
      },
      upcoming,
      completed,
      exams: enrichedExams
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching exams'
    });
  }
};

// @desc    Create an exam
// @route   POST /api/exams
// @access  Private
export const createExam = async (req, res) => {
  try {
    const { subjectId, examDate, startTime, endTime, venue, examType, syllabus, maxMarks, notes } = req.body;

    if (!subjectId || !examDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject and exam date'
      });
    }

    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject not found or does not belong to you'
      });
    }

    const exam = await Exam.create({
      userId: req.user._id,
      subjectId,
      examDate: new Date(examDate),
      startTime: startTime || '10:00',
      endTime: endTime || '13:00',
      venue: venue || 'Main Exam Hall',
      examType: examType || 'Midterm',
      syllabus: syllabus || '',
      maxMarks: maxMarks || 100,
      notes: notes || ''
    });

    const populated = await exam.populate('subjectId', 'name code color');

    return res.status(201).json({
      success: true,
      message: 'Exam scheduled successfully',
      exam: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating exam'
    });
  }
};

// @desc    Update exam details
// @route   PUT /api/exams/:id
// @access  Private
export const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    const { subjectId, examDate, startTime, endTime, venue, examType, syllabus, maxMarks, obtainedMarks, isCompleted, notes } = req.body;

    if (subjectId) {
      const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
      if (!subject) {
        return res.status(400).json({
          success: false,
          message: 'Subject does not belong to you'
        });
      }
      exam.subjectId = subjectId;
    }

    if (examDate) exam.examDate = new Date(examDate);
    if (startTime) exam.startTime = startTime;
    if (endTime) exam.endTime = endTime;
    if (venue !== undefined) exam.venue = venue;
    if (examType) exam.examType = examType;
    if (syllabus !== undefined) exam.syllabus = syllabus;
    if (maxMarks !== undefined) exam.maxMarks = Number(maxMarks);
    if (obtainedMarks !== undefined) exam.obtainedMarks = obtainedMarks === '' ? null : Number(obtainedMarks);
    if (isCompleted !== undefined) exam.isCompleted = Boolean(isCompleted);
    if (notes !== undefined) exam.notes = notes;

    const updated = await exam.save();
    const populated = await updated.populate('subjectId', 'name code color');

    return res.status(200).json({
      success: true,
      message: 'Exam updated successfully',
      exam: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating exam'
    });
  }
};

// @desc    Toggle exam completed status
// @route   PATCH /api/exams/:id/toggle
// @access  Private
export const toggleExamCompleted = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    exam.isCompleted = !exam.isCompleted;
    const updated = await exam.save();
    const populated = await updated.populate('subjectId', 'name code color');

    return res.status(200).json({
      success: true,
      message: exam.isCompleted ? 'Exam marked as completed' : 'Exam moved back to upcoming',
      exam: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating exam status'
    });
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private
export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    await Exam.deleteOne({ _id: exam._id });

    return res.status(200).json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting exam'
    });
  }
};
