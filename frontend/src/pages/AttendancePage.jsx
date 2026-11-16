import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Filter,
  Sparkles,
  Shield,
  Sliders,
  ChevronDown
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CardSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const AttendancePage = () => {
  const { user, updateProfile } = useAuth();
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  // Target Attendance State
  const [targetAttendance, setTargetAttendance] = useState(user?.targetAttendance || 75);
  const [updatingTarget, setUpdatingTarget] = useState(false);

  // Filters for History Logs
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Manual Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    subjectId: '',
    status: 'Present',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Log
  const [deleteLogItem, setDeleteLogItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance');
      if (res.success) {
        setData(res);
        if (res.target) setTargetAttendance(res.target);
      }
    } catch (err) {
      toast.error(err.message || 'Error fetching attendance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await api.get('/attendance/logs', {
        subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined
      });
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [selectedSubject, selectedStatus]);

  // Quick mark attendance button directly from subject card
  const handleQuickMark = async (subjectId, status) => {
    try {
      const res = await api.post('/attendance', {
        subjectId,
        status,
        date: new Date().toISOString()
      });
      if (res.success) {
        toast.success(`Marked ${status}!`);
        fetchOverview();
        fetchLogs();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to record attendance');
    }
  };

  // Update target attendance
  const handleSaveTarget = async (newVal) => {
    const val = Number(newVal);
    setTargetAttendance(val);
    setUpdatingTarget(true);
    try {
      await updateProfile({ targetAttendance: val });
      fetchOverview();
      toast.success(`Target threshold set to ${val}%`);
    } catch (err) {
      toast.error('Failed to update target');
    } finally {
      setUpdatingTarget(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.subjectId) {
      toast.error('Please select a subject');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/attendance', manualForm);
      toast.success('Attendance entry recorded');
      setIsModalOpen(false);
      fetchOverview();
      fetchLogs();
    } catch (err) {
      toast.error(err.message || 'Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async () => {
    if (!deleteLogItem) return;
    setDeleting(true);
    try {
      await api.delete(`/attendance/${deleteLogItem._id}`);
      toast.success('Record deleted');
      setDeleteLogItem(null);
      fetchOverview();
      fetchLogs();
    } catch (err) {
      toast.error('Failed to delete attendance record');
    } finally {
      setDeleting(false);
    }
  };

  const overall = data?.overallStats || {
    total: 0,
    attended: 0,
    absent: 0,
    excused: 0,
    percentage: 100,
    isLow: false
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Attendance Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time percentage tracking, target simulator, and absence margin calculator
          </p>
        </div>

        <button
          onClick={() => {
            if (data?.subjects?.length > 0) {
              setManualForm((prev) => ({ ...prev, subjectId: data.subjects[0].subject._id }));
            }
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Attendance</span>
        </button>
      </div>

      {/* Target Setter & Overall Status Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Overall Status Card */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Shield className="w-4 h-4" />
              Aggregate Attendance
            </span>
            <div className="flex items-baseline justify-center sm:justify-start gap-3">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                {overall.percentage}%
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${overall.isLow ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
                {overall.isLow ? 'Threshold Warning' : 'Safe Standing'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {overall.attended} attended / {overall.total} total classes conducted across all registered subjects
            </p>
          </div>

          <div className="flex items-center gap-4 text-center shrink-0">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
              <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">
                {overall.attended}
              </span>
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Present</span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50">
              <span className="block text-xl font-black text-rose-600 dark:text-rose-400">
                {overall.absent}
              </span>
              <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase">Absent</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
              <span className="block text-xl font-black text-amber-600 dark:text-amber-400">
                {overall.excused}
              </span>
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">Excused</span>
            </div>
          </div>
        </div>

        {/* Target Attendance Setter */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-500" />
                Target Minimum %
              </span>
              <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {targetAttendance}%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Universities typically require 75% or 80% to sit for end-semester exams.
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={targetAttendance}
              onChange={(e) => setTargetAttendance(Number(e.target.value))}
              onMouseUp={(e) => handleSaveTarget(e.target.value)}
              onTouchEnd={(e) => handleSaveTarget(e.target.value)}
              className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>50%</span>
              <span className="font-bold text-indigo-500">75% (Standard)</span>
              <span>85%</span>
              <span>95%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Cards Grid with 1-Click Marking & Predictive Calculator */}
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 pt-2">
        Subject Attendance & Margin Calculator
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : data?.subjects?.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No Subjects to Track"
          description="Add your course subjects first to start tracking attendance and predicting safe margins."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.subjects?.map(({ subject, stats }) => {
            const isLow = stats.isLow;
            const pct = stats.percentage;

            return (
              <div
                key={subject._id}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between ${
                  isLow
                    ? 'border-rose-200 dark:border-rose-900/60 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: subject.color || '#3b82f6' }}
                      />
                      <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {subject.code}
                      </span>
                    </div>

                    <span
                      className={`text-sm font-black ${
                        isLow ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {subject.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-3">
                    {subject.facultyName}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isLow ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  {/* Counts Row */}
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                    <span>
                      Attended: <strong className="text-slate-900 dark:text-white">{stats.attended}</strong>
                    </span>
                    <span>
                      Missed: <strong className="text-slate-900 dark:text-white">{stats.absent}</strong>
                    </span>
                    <span>
                      Total: <strong className="text-slate-900 dark:text-white">{stats.total}</strong>
                    </span>
                  </div>

                  {/* Academic Calculation Callout */}
                  <div
                    className={`p-3 rounded-2xl text-xs mb-4 ${
                      isLow
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200/80 dark:border-rose-900/60'
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-900/60'
                    }`}
                  >
                    {isLow ? (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Attendance Low!</strong>
                          <span>
                            Attend next <strong>{stats.classesNeeded}</strong> consecutive class
                            {stats.classesNeeded === 1 ? '' : 'es'} to reach {stats.target}%.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <div>
                          <strong className="block font-bold">On Track!</strong>
                          <span>
                            You can safely miss <strong>{stats.safeToMiss}</strong> class
                            {stats.safeToMiss === 1 ? '' : 'es'} without dropping below {stats.target}%.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 1-Click Quick Mark Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    Quick Log Today:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleQuickMark(subject._id, 'Present')}
                      className="py-1.5 px-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60 rounded-xl transition-colors text-center"
                    >
                      + Present
                    </button>
                    <button
                      onClick={() => handleQuickMark(subject._id, 'Absent')}
                      className="py-1.5 px-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60 rounded-xl transition-colors text-center"
                    >
                      + Absent
                    </button>
                    <button
                      onClick={() => handleQuickMark(subject._id, 'Excused')}
                      className="py-1.5 px-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-900/60 rounded-xl transition-colors text-center"
                    >
                      + Leave
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attendance History Logs Table */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Attendance History Log
          </h2>

          <div className="flex items-center gap-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All Subjects</option>
              {data?.subjects?.map((s) => (
                <option key={s.subject._id} value={s.subject._id}>
                  {s.subject.code} - {s.subject.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Excused">Excused</option>
            </select>
          </div>
        </div>

        {logsLoading ? (
          <TableSkeleton rows={4} />
        ) : logs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">
            No attendance history entries recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Date</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes / Lecture Topic</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {log.subjectId?.code} - {log.subjectId?.name}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold ${
                          log.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : log.status === 'Absent'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {log.note || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setDeleteLogItem(log)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Delete log entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
              Log Attendance Entry
            </h2>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <select
                  value={manualForm.subjectId}
                  onChange={(e) => setManualForm({ ...manualForm, subjectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                >
                  {data?.subjects?.map((s) => (
                    <option key={s.subject._id} value={s.subject._id}>
                      {s.subject.code} - {s.subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Status *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Present', 'Absent', 'Excused'].map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setManualForm({ ...manualForm, status: st })}
                      className={`py-2 text-xs font-bold rounded-xl border-2 transition-all ${
                        manualForm.status === st
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Class Date *
                </label>
                <input
                  type="date"
                  required
                  value={manualForm.date}
                  onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lecture Topic / Session Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4 Paging and Page Faults"
                  value={manualForm.note}
                  onChange={(e) => setManualForm({ ...manualForm, note: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Record Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteLogItem}
        title="Delete Attendance Record?"
        message="This will remove this specific class log and recalculate your attendance percentage accordingly."
        loading={deleting}
        onConfirm={handleDeleteLog}
        onCancel={() => setDeleteLogItem(null)}
      />
    </div>
  );
};
