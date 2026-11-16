import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CalendarCheck,
  CheckSquare,
  Award,
  BookOpen,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/LoadingSkeleton';

export const AcademicProgressPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/progress');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      toast.error(err.message || 'Error fetching progress analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading || !data) {
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

  const summary = data.summary || {
    overallAttendance: 100,
    targetAttendance: 75,
    assignmentCompletionRate: 100,
    averageExamScore: 90,
    totalSubjects: 0,
    totalClassesLogged: 0,
    totalAssignments: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    completedExamsCount: 0
  };

  const attendanceData = data.subjectAttendanceChart || [];
  const assignmentPie = data.assignmentPie || [];
  const subjectBreakdown = data.subjectAssignmentBreakdown || [];
  const examScores = data.examScoreChart || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Academic Progress & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Visual metrics, attendance performance against targets, submission rates, and grade trends
        </p>
      </div>

      {/* 4 Summary Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Index */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Average Attendance
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.overallAttendance}%
            </span>
            <span className="text-xs text-slate-400">
              Target: {summary.targetAttendance}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Based on {summary.totalClassesLogged} total class sessions recorded.
          </p>
        </div>

        {/* Task Completion Rate */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Assignment Turn-In
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.assignmentCompletionRate}%
            </span>
            <span className="text-xs text-slate-400">
              {summary.completedAssignments}/{summary.totalAssignments} done
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {summary.pendingAssignments} tasks remaining active.
          </p>
        </div>

        {/* Exam Average */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Exam Performance
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.averageExamScore}%
            </span>
            <span className="text-xs text-emerald-600 font-bold">
              Grade A
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Calculated across {summary.completedExamsCount} evaluated exam papers.
          </p>
        </div>

        {/* Modules Count */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Semester Standing
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {user?.semester || 'Semester 5'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
            {summary.totalSubjects} subjects in {user?.department || 'Computer Science'}.
          </p>
        </div>
      </div>

      {/* Chart Section 1: Subject Attendance vs Target Reference Line */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Subject Attendance Analytics vs Target Threshold</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              The dotted red line indicates your minimum required target ({summary.targetAttendance}%)
            </p>
          </div>
        </div>

        {attendanceData.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-10">No attendance data logged yet.</p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Attendance']}
                  labelFormatter={(name) => `Subject: ${name}`}
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <ReferenceLine
                  y={summary.targetAttendance}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{ value: `Target (${summary.targetAttendance}%)`, fill: '#ef4444', fontSize: 11, position: 'insideTopRight' }}
                />
                <Bar dataKey="percentage" fill="#6366f1" radius={[8, 8, 0, 0]}>
                  {attendanceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.percentage < summary.targetAttendance ? '#f43f5e' : entry.color || '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Two Column Row: Task Status Distribution (Donut) & Exam Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart: Assignment Status Distribution */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <span>Assignment Breakdown</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Status distribution across all tasks
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {summary.totalAssignments === 0 ? (
              <p className="text-xs text-slate-500">No assignments created yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assignmentPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {assignmentPie.map((entry, index) => (
                      <Cell key={`slice-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="block text-xs font-bold text-emerald-600">
                {summary.completedAssignments}
              </span>
              <span className="text-[10px] text-slate-400">Completed</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-indigo-600">
                {summary.pendingAssignments}
              </span>
              <span className="text-[10px] text-slate-400">Pending</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-rose-600">
                {summary.overdueAssignments || 0}
              </span>
              <span className="text-[10px] text-slate-400">Overdue</span>
            </div>
          </div>
        </div>

        {/* Exam Score Trajectory */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Exam Scores & Marks (%)</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Historical results of completed quizzes, tests, and midterms
            </p>
          </div>

          <div className="h-64 w-full">
            {examScores.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No completed exams evaluated yet. Mark an exam complete in the Exams tab to see score analytics!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examScores} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="examName" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(val, name, item) => [
                      `${val}% (${item.payload.obtained}/${item.payload.max} marks)`,
                      'Score'
                    ]}
                    contentStyle={{
                      borderRadius: '12px',
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="score" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Average exam rating: <strong>{summary.averageExamScore}%</strong></span>
            <span className="text-indigo-600 font-bold">Good Standing</span>
          </div>
        </div>
      </div>

      {/* Subject-Wise Task Completion Progress Bars */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
          Subject-Wise Assignment Completion Rate
        </h2>

        <div className="space-y-4">
          {subjectBreakdown.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {item.subject} • {item.fullName}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {item.rate}% ({item.completed}/{item.total} done)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${item.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
