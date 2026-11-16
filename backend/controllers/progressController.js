import Subject from '../models/Subject.js';
import Assignment from '../models/Assignment.js';
import Attendance from '../models/Attendance.js';
import Exam from '../models/Exam.js';
import Note from '../models/Note.js';
import Timetable from '../models/Timetable.js';
import User from '../models/User.js';

// @desc    Get complete dashboard overview data
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const target = user?.targetAttendance || 75;
    const now = new Date();

    const [
      subjects,
      allAssignments,
      allAttendance,
      upcomingExams,
      timetableEntries,
      recentNotes
    ] = await Promise.all([
      Subject.find({ userId }).sort({ code: 1 }),
      Assignment.find({ userId }).populate('subjectId', 'name code color').sort({ dueDate: 1 }),
      Attendance.find({ userId }).populate('subjectId', 'name code color').sort({ date: -1 }),
      Exam.find({ userId, isCompleted: false }).populate('subjectId', 'name code color').sort({ examDate: 1 }).limit(5),
      Timetable.find({ userId }).populate('subjectId', 'name code facultyName color').sort({ startTime: 1 }),
      Note.find({ userId }).populate('subjectId', 'name code').sort({ updatedAt: -1 }).limit(4)
    ]);

    // Assignments summary
    const completedAssignments = allAssignments.filter((a) => a.status === 'Completed').length;
    const pendingAssignments = allAssignments.filter((a) => a.status === 'Pending').length;
    const overdueAssignments = allAssignments.filter(
      (a) => a.status === 'Pending' && new Date(a.dueDate) < now
    ).length;

    // Upcoming assignments (next 7-14 days or top 5 pending)
    const upcomingDeadlines = allAssignments
      .filter((a) => a.status === 'Pending')
      .slice(0, 5)
      .map((a) => {
        const diff = Math.ceil((new Date(a.dueDate) - now) / (1000 * 60 * 60 * 24));
        return {
          ...a.toObject(),
          daysRemaining: diff,
          isOverdue: diff < 0
        };
      });

    // Attendance calculations
    const totalClasses = allAttendance.length;
    const attendedClasses = allAttendance.filter((a) => a.status === 'Present').length;
    const overallAttendance = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

    // Today's classes
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[now.getDay()];
    const todayClasses = timetableEntries.filter((t) => t.day === currentDayName);

    // Subject attendance breakdown for quick overview
    const subjectAttendance = subjects.map((subj) => {
      const records = allAttendance.filter((a) => a.subjectId?._id?.toString() === subj._id.toString() || a.subjectId?.toString() === subj._id.toString());
      const total = records.length;
      const attended = records.filter((r) => r.status === 'Present').length;
      const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;
      return {
        _id: subj._id,
        name: subj.name,
        code: subj.code,
        color: subj.color,
        total,
        attended,
        percentage,
        isLow: percentage < target
      };
    });

    // Recent activity feed: synthetic combination of recent attendance, recent assignments, notes
    const activities = [];

    allAttendance.slice(0, 4).forEach((att) => {
      activities.push({
        type: 'attendance',
        title: `Marked ${att.status} for ${att.subjectId?.name || 'Class'}`,
        timestamp: att.date || att.createdAt,
        status: att.status,
        color: att.status === 'Present' ? '#10b981' : att.status === 'Absent' ? '#ef4444' : '#f59e0b'
      });
    });

    allAssignments.slice(0, 4).forEach((assn) => {
      activities.push({
        type: 'assignment',
        title: assn.status === 'Completed' ? `Completed "${assn.title}"` : `New assignment "${assn.title}" due`,
        timestamp: assn.updatedAt || assn.createdAt,
        status: assn.status,
        color: assn.status === 'Completed' ? '#3b82f6' : '#8b5cf6'
      });
    });

    recentNotes.slice(0, 2).forEach((nt) => {
      activities.push({
        type: 'note',
        title: `Updated note: "${nt.title}"`,
        timestamp: nt.updatedAt || nt.createdAt,
        color: '#6366f1'
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json({
      success: true,
      summary: {
        totalSubjects: subjects.length,
        totalAssignments: allAssignments.length,
        completedAssignments,
        pendingAssignments,
        overdueAssignments,
        attendancePercentage: overallAttendance,
        targetAttendance: target,
        upcomingExamsCount: upcomingExams.length,
        todayClassesCount: todayClasses.length
      },
      todayClasses,
      upcomingDeadlines,
      upcomingExams,
      subjectAttendance,
      recentActivities: activities.slice(0, 6)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dashboard data'
    });
  }
};

// @desc    Get comprehensive academic progress & analytics
// @route   GET /api/progress
// @access  Private
export const getAcademicProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const target = user?.targetAttendance || 75;

    const [subjects, assignments, attendance, exams] = await Promise.all([
      Subject.find({ userId }).sort({ code: 1 }),
      Assignment.find({ userId }).populate('subjectId', 'name code color'),
      Attendance.find({ userId }).populate('subjectId', 'name code color'),
      Exam.find({ userId }).populate('subjectId', 'name code color').sort({ examDate: 1 })
    ]);

    // 1. Subject-wise Attendance Performance
    const subjectAttendanceChart = subjects.map((subj) => {
      const records = attendance.filter(
        (a) => a.subjectId?._id?.toString() === subj._id.toString() || a.subjectId?.toString() === subj._id.toString()
      );
      const total = records.length;
      const attended = records.filter((r) => r.status === 'Present').length;
      const missed = records.filter((r) => r.status === 'Absent').length;
      const excused = records.filter((r) => r.status === 'Excused').length;
      const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;

      return {
        subject: subj.code,
        fullName: subj.name,
        color: subj.color,
        attended,
        missed,
        excused,
        total,
        percentage,
        target
      };
    });

    // 2. Assignment Completion Statistics
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter((a) => a.status === 'Completed').length;
    const pendingAssignments = assignments.filter((a) => a.status === 'Pending').length;
    const overdueAssignments = assignments.filter(
      (a) => a.status === 'Pending' && new Date(a.dueDate) < new Date()
    ).length;

    const assignmentPie = [
      { name: 'Completed', value: completedAssignments, color: '#10b981' },
      { name: 'In Progress', value: Math.max(0, pendingAssignments - overdueAssignments), color: '#3b82f6' },
      { name: 'Overdue', value: overdueAssignments, color: '#ef4444' }
    ];

    // 3. Subject-wise Assignment Breakdown
    const subjectAssignmentBreakdown = subjects.map((subj) => {
      const subjectAssignments = assignments.filter(
        (a) => a.subjectId?._id?.toString() === subj._id.toString() || a.subjectId?.toString() === subj._id.toString()
      );
      const done = subjectAssignments.filter((a) => a.status === 'Completed').length;
      const total = subjectAssignments.length;
      const rate = total > 0 ? Math.round((done / total) * 100) : 100;

      return {
        subject: subj.code,
        fullName: subj.name,
        completed: done,
        total,
        rate
      };
    });

    // 4. Exam Performance & Scores
    const completedExams = exams.filter((e) => e.isCompleted && e.obtainedMarks !== null);
    const examScoreChart = completedExams.map((e) => {
      const percentage = e.maxMarks > 0 ? Math.round((e.obtainedMarks / e.maxMarks) * 100) : 0;
      return {
        examName: `${e.subjectId?.code || 'Exam'} (${e.examType})`,
        score: percentage,
        obtained: e.obtainedMarks,
        max: e.maxMarks,
        date: e.examDate ? new Date(e.examDate).toLocaleDateString() : ''
      };
    });

    // Average score across completed exams
    const avgExamScore =
      completedExams.length > 0
        ? Math.round(
            completedExams.reduce((acc, curr) => acc + (curr.obtainedMarks / curr.maxMarks) * 100, 0) /
              completedExams.length
          )
        : 85;

    // Overall Attendance
    const totalClasses = attendance.length;
    const totalAttended = attendance.filter((a) => a.status === 'Present').length;
    const overallAttendancePercent = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 100;

    return res.status(200).json({
      success: true,
      summary: {
        overallAttendance: overallAttendancePercent,
        targetAttendance: target,
        assignmentCompletionRate: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 100,
        averageExamScore: avgExamScore,
        totalSubjects: subjects.length,
        totalClassesLogged: totalClasses,
        totalAssignments,
        completedAssignments,
        pendingAssignments,
        completedExamsCount: completedExams.length
      },
      subjectAttendanceChart,
      assignmentPie,
      subjectAssignmentBreakdown,
      examScoreChart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error calculating progress analytics'
    });
  }
};
