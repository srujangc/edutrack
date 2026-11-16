import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckSquare,
  CalendarCheck,
  GraduationCap,
  Clock,
  AlertTriangle,
  ArrowRight,
  Plus,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileText,
  Flame,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { QuickActionModal } from '../components/QuickActionModal';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const handleRefresh = () => fetchDashboard();
    window.addEventListener('edutrack-data-refresh', handleRefresh);
    return () => window.removeEventListener('edutrack-data-refresh', handleRefresh);
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalSubjects: 0,
    totalAssignments: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    overdueAssignments: 0,
    attendancePercentage: 100,
    targetAttendance: user?.targetAttendance || 75,
    upcomingExamsCount: 0,
    todayClassesCount: 0
  };

  const attendanceIsLow = summary.attendancePercentage < summary.targetAttendance;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Academic Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Hello, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {user?.college} • {user?.semester} • {user?.department}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setQuickActionOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Academic Entry</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Attendance */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Attendance</span>
            <div className={`p-2 rounded-xl ${attendanceIsLow ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'}`}>
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.attendancePercentage}%
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Target: {summary.targetAttendance}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                attendanceIsLow ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, summary.attendancePercentage)}%` }}
            />
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            {attendanceIsLow ? (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Below target threshold!
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Good standing
              </span>
            )}
            <Link to="/app/attendance" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              View Logs →
            </Link>
          </p>
        </div>

        {/* Card 2: Assignments */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assignments</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.pendingAssignments}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              pending / {summary.totalAssignments} total
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                {summary.completedAssignments} Done
              </span>
              {summary.overdueAssignments > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold animate-pulse">
                  {summary.overdueAssignments} Overdue
                </span>
              )}
            </div>
            <Link to="/app/assignments" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              View Tasks →
            </Link>
          </div>
        </div>

        {/* Card 3: Subjects */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Enrolled Subjects</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.totalSubjects}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Core Modules
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 flex items-center justify-between">
            <span>{user?.semester || 'Semester 5'} Curriculum</span>
            <Link to="/app/subjects" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Manage →
            </Link>
          </p>
        </div>

        {/* Card 4: Upcoming Exams */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Upcoming Exams</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.upcomingExamsCount}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Scheduled
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 flex items-center justify-between">
            <span>Midterms & Finals</span>
            <Link to="/app/exams" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Countdown →
            </Link>
          </p>
        </div>
      </div>

      {/* Main Grid: Today's Timetable + Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Classes & Subject Attendance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Timetable */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Today's Classes
                </h2>
              </div>
              <Link to="/app/timetable" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <span>Full Timetable</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data?.todayClasses?.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No classes scheduled for today!
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Enjoy your day or catch up on pending assignments.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.todayClasses?.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: item.subjectId?.color || '#6366f1' }}
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {item.subjectId?.name || 'Class'}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.subjectId?.code} • {item.classroom} • {item.subjectId?.facultyName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subject-Wise Attendance Progress */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Subject Attendance Matrix
              </h2>
              <Link to="/app/attendance" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Attendance Details →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {data?.subjectAttendance?.map((subj) => (
                <div
                  key={subj._id}
                  className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                      {subj.code} - {subj.name}
                    </span>
                    <span
                      className={`text-xs font-extrabold ${
                        subj.isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {subj.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        subj.isLow ? 'bg-rose-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, subj.percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>{subj.attended} attended / {subj.total} total</span>
                    {subj.isLow && (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">Needs boost!</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Deadlines, Exams & Recent Activity */}
        <div className="space-y-6">
          {/* Upcoming Assignment Deadlines */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                Deadlines Approaching
              </h2>
              <Link to="/app/assignments" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                All Tasks →
              </Link>
            </div>

            {data?.upcomingDeadlines?.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
                No pending assignment deadlines! Great job! 🎉
              </p>
            ) : (
              <div className="space-y-2.5">
                {data?.upcomingDeadlines?.map((task) => {
                  const days = task.daysRemaining;
                  const isOverdue = task.isOverdue;
                  const isUrgent = days <= 2 && !isOverdue;

                  return (
                    <div
                      key={task._id}
                      className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                          {task.subjectId?.code || 'Task'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                          {task.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Priority: {task.priority}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full inline-block ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : isUrgent
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {isOverdue ? 'Overdue' : days === 0 ? 'Today' : `${days}d left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


          {/* Recent Activity Feed */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {data?.recentActivities?.map((act, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: act.color }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 dark:text-slate-200 leading-tight">
                      {act.title}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating / Embedded Quick Action Modal */}
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onActionSuccess={fetchDashboard}
      />
    </div>
  );
};
