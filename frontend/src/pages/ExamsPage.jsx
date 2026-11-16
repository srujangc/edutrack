import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Award,
  BookOpen
} from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const ExamsPage = () => {
  const [data, setData] = useState({ upcoming: [], completed: [], counts: { total: 0, upcoming: 0, completed: 0 } });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming'); // 'upcoming' | 'completed'

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form, setForm] = useState({
    subjectId: '',
    examDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '13:00',
    venue: 'Exam Hall 1',
    examType: 'Midterm',
    syllabus: '',
    maxMarks: 100,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Grade Completion Modal
  const [completingExam, setCompletingExam] = useState(null);
  const [marksForm, setMarksForm] = useState({ obtainedMarks: '', maxMarks: 100 });

  // Delete
  const [deleteExamItem, setDeleteExamItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const fetchExams = async () => {
    try {
      setLoading(true);
      const [examRes, subjRes] = await Promise.all([
        api.get('/exams'),
        api.get('/subjects')
      ]);

      if (examRes.success) {
        setData(examRes);
      }
      if (subjRes.success) {
        setSubjects(subjRes.subjects);
      }
    } catch (err) {
      toast.error(err.message || 'Error fetching exam schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleOpenCreate = () => {
    setEditingExam(null);
    setForm({
      subjectId: subjects.length > 0 ? subjects[0]._id : '',
      examDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '13:00',
      venue: 'Main Academic Auditorium',
      examType: 'Midterm',
      syllabus: '',
      maxMarks: 100,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam) => {
    setEditingExam(exam);
    setForm({
      subjectId: exam.subjectId?._id || exam.subjectId || '',
      examDate: exam.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : '',
      startTime: exam.startTime || '10:00',
      endTime: exam.endTime || '13:00',
      venue: exam.venue || '',
      examType: exam.examType || 'Midterm',
      syllabus: exam.syllabus || '',
      maxMarks: exam.maxMarks || 100,
      notes: exam.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.subjectId || !form.examDate) {
      toast.error('Please enter subject and exam date');
      return;
    }

    setSubmitting(true);
    try {
      if (editingExam) {
        await api.put(`/exams/${editingExam._id}`, form);
        toast.success('Exam details updated successfully');
      } else {
        await api.post('/exams', form);
        toast.success('Exam scheduled successfully');
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (err) {
      toast.error(err.message || 'Failed to save exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (exam) => {
    if (!exam.isCompleted) {
      // Open score entry dialog
      setCompletingExam(exam);
      setMarksForm({ obtainedMarks: '', maxMarks: exam.maxMarks || 100 });
    } else {
      // Revert back to upcoming
      try {
        await api.patch(`/exams/${exam._id}/toggle`);
        toast.info('Exam moved back to upcoming list');
        fetchExams();
      } catch (err) {
        toast.error('Failed to update status');
      }
    }
  };

  const handleConfirmCompletion = async (e) => {
    e.preventDefault();
    if (!completingExam) return;
    try {
      await api.put(`/exams/${completingExam._id}`, {
        isCompleted: true,
        obtainedMarks: marksForm.obtainedMarks ? Number(marksForm.obtainedMarks) : null,
        maxMarks: Number(marksForm.maxMarks)
      });
      toast.success('Exam marked as completed!');
      setCompletingExam(null);
      fetchExams();
    } catch (err) {
      toast.error(err.message || 'Error completing exam');
    }
  };

  const handleDelete = async () => {
    if (!deleteExamItem) return;
    setDeleting(true);
    try {
      await api.delete(`/exams/${deleteExamItem._id}`);
      toast.success('Exam schedule removed');
      setDeleteExamItem(null);
      fetchExams();
    } catch (err) {
      toast.error('Failed to delete exam');
    } finally {
      setDeleting(false);
    }
  };

  const list = tab === 'upcoming' ? data.upcoming : data.completed;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Examination Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Midterms, finals, viva practicals, live countdown clocks, and scorecards
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Exam</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setTab('upcoming')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            tab === 'upcoming'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <span>Upcoming Exams</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${tab === 'upcoming' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
            {data.counts?.upcoming || 0}
          </span>
        </button>

        <button
          onClick={() => setTab('completed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            tab === 'completed'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <span>Completed Exams</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${tab === 'completed' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
            {data.counts?.completed || 0}
          </span>
        </button>
      </div>

      {/* Exam Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={tab === 'upcoming' ? 'No Upcoming Examinations' : 'No Completed Exams Yet'}
          description={
            tab === 'upcoming'
              ? 'You have zero upcoming exams scheduled. Add your midterm or final examination schedule.'
              : 'Completed exams and scores will appear here after marking.'
          }
          actionLabel={tab === 'upcoming' ? 'Schedule Exam' : undefined}
          onAction={tab === 'upcoming' ? handleOpenCreate : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {list.map((exam) => {
            const isCompleted = exam.isCompleted;
            const cd = exam.countdown || { days: 0, hours: 0 };
            const result = exam.result || {};

            return (
              <div
                key={exam._id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Type badge, countdown badge, actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: exam.subjectId?.color || '#6366f1' }}
                      />
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                        {exam.subjectId?.code || 'CS'}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        {exam.examType}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(exam)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Exam"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteExamItem(exam)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subject Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {exam.subjectId?.name || 'Subject Exam'}
                  </h3>

                  {/* Venue and Timing */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="flex items-center gap-2 font-medium">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>{new Date(exam.examDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </p>
                    <p className="flex items-center gap-2 font-medium">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>{exam.startTime} - {exam.endTime}</span>
                    </p>
                    <p className="flex items-center gap-2 font-medium">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      <span>{exam.venue}</span>
                    </p>
                  </div>

                  {/* Syllabus / Notes */}
                  {exam.syllabus && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                      <strong className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Syllabus Covered:
                      </strong>
                      <p className="line-clamp-2 leading-relaxed">{exam.syllabus}</p>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Countdown Clock or Result Grade */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {!isCompleted ? (
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/60 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs font-bold font-mono">
                        ⏳ {cd.days}d {cd.hours}h left
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                          {exam.obtainedMarks !== null ? exam.obtainedMarks : '—'}
                        </span>
                        <span className="text-xs text-slate-400">/ {exam.maxMarks}</span>
                      </div>
                      {result.grade && (
                        <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Grade {result.grade} ({result.percentage}%)
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleToggleComplete(exam)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      isCompleted
                        ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'Edit Score' : 'Mark Completed'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingExam ? 'Edit Examination' : 'Schedule Examination'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={form.subjectId}
                    onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Type
                  </label>
                  <select
                    value={form.examType}
                    onChange={(e) => setForm({ ...form, examType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  >
                    <option value="Midterm">Midterm Examination</option>
                    <option value="Final">End-Semester Final</option>
                    <option value="Quiz">Surprise / Class Quiz</option>
                    <option value="Practical">Lab Viva / Practical</option>
                    <option value="Unit Test">Unit Test</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.examDate}
                    onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Venue / Examination Hall
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Auditorium Complex Block A"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={form.maxMarks}
                    onChange={(e) => setForm({ ...form, maxMarks: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Syllabus Covered & Reference Chapters
                </label>
                <textarea
                  rows={2}
                  placeholder="Units 1 to 3, dynamic programming, normalization, SQL joins..."
                  value={form.syllabus}
                  onChange={(e) => setForm({ ...form, syllabus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white resize-none"
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
                  {submitting ? 'Saving...' : editingExam ? 'Update Exam' : 'Schedule Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Exam & Enter Score Modal */}
      {completingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Mark Exam Completed
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter your obtained score for {completingExam.subjectId?.name} ({completingExam.examType})
            </p>

            <form onSubmit={handleConfirmCompletion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Marks Obtained
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={marksForm.maxMarks}
                    placeholder="e.g. 88"
                    value={marksForm.obtainedMarks}
                    onChange={(e) => setMarksForm({ ...marksForm, obtainedMarks: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Out of
                  </label>
                  <input
                    type="number"
                    value={marksForm.maxMarks}
                    onChange={(e) => setMarksForm({ ...marksForm, maxMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingExam(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Confirm & Save Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteExamItem}
        title="Delete Examination Schedule?"
        message={`Are you sure you want to delete the scheduled ${deleteExamItem?.examType} exam for ${deleteExamItem?.subjectId?.name}?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteExamItem(null)}
      />
    </div>
  );
};
