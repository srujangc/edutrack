import React, { useState, useEffect } from 'react';
import {
  X,
  CalendarCheck,
  CheckSquare,
  GraduationCap,
  FileText,
  AlertCircle
} from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export const QuickActionModal = ({ isOpen, onClose, onActionSuccess }) => {
  const [activeTab, setActiveTab] = useState('assignment'); // 'assignment', 'attendance', 'exam', 'note'
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  // Forms state
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subjectId: '',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    priority: 'Medium',
    description: ''
  });

  const [attendanceForm, setAttendanceForm] = useState({
    subjectId: '',
    status: 'Present',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const [examForm, setExamForm] = useState({
    subjectId: '',
    examDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '13:00',
    examType: 'Midterm',
    venue: 'Hall 1'
  });

  const [noteForm, setNoteForm] = useState({
    title: '',
    subjectId: '',
    content: '',
    isFavorite: false
  });

  // Fetch subjects for dropdowns
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.get('/subjects')
        .then((res) => {
          if (res.success && res.subjects) {
            setSubjects(res.subjects);
            if (res.subjects.length > 0) {
              const firstId = res.subjects[0]._id;
              setAssignmentForm((prev) => ({ ...prev, subjectId: prev.subjectId || firstId }));
              setAttendanceForm((prev) => ({ ...prev, subjectId: prev.subjectId || firstId }));
              setExamForm((prev) => ({ ...prev, subjectId: prev.subjectId || firstId }));
              setNoteForm((prev) => ({ ...prev, subjectId: prev.subjectId || firstId }));
            }
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentForm.title || !assignmentForm.subjectId) {
      toast.error('Please enter title and select a subject');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/assignments', assignmentForm);
      toast.success('Assignment created successfully!');
      onActionSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordAttendance = async (e) => {
    e.preventDefault();
    if (!attendanceForm.subjectId) {
      toast.error('Please select a subject');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/attendance', attendanceForm);
      toast.success(`Logged attendance: ${attendanceForm.status}!`);
      onActionSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!examForm.subjectId || !examForm.examDate) {
      toast.error('Please fill in exam details');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/exams', examForm);
      toast.success('Exam scheduled successfully!');
      onActionSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to schedule exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteForm.title || !noteForm.content) {
      toast.error('Please provide note title and content');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/notes', noteForm);
      toast.success('Note saved successfully!');
      onActionSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save note');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Quick Action
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 gap-2 bg-slate-50/50 dark:bg-slate-950/30">
          {[
            { id: 'assignment', label: 'Assignment', icon: CheckSquare },
            { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
            { id: 'exam', label: 'Exam', icon: GraduationCap },
            { id: 'note', label: 'Note', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 ${
                  active
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6">
          {subjects.length === 0 && !loading && (
            <div className="p-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>You don't have any subjects added yet. Please add a subject first in the Subjects page or load sample data from Settings.</span>
            </div>
          )}

          {/* TAB 1: Assignment */}
          {activeTab === 'assignment' && (
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red-Black Tree Implementation"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={assignmentForm.subjectId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, subjectId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
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
                    Priority
                  </label>
                  <select
                    value={assignmentForm.priority}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional guidelines, requirements, or links..."
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {submitting ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Attendance */}
          {activeTab === 'attendance' && (
            <form onSubmit={handleRecordAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <select
                  value={attendanceForm.subjectId}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, subjectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Status *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Present', label: 'Present', color: 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' },
                    { id: 'Absent', label: 'Absent', color: 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/50' },
                    { id: 'Excused', label: 'Excused', color: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/50' },
                  ].map((statusOpt) => (
                    <button
                      type="button"
                      key={statusOpt.id}
                      onClick={() => setAttendanceForm({ ...attendanceForm, status: statusOpt.id })}
                      className={`py-2 text-xs font-bold rounded-xl border-2 transition-all ${
                        attendanceForm.status === statusOpt.id
                          ? statusOpt.color
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {statusOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={attendanceForm.date}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Note / Topic (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit 3 Dijkstra Algorithm lecture"
                  value={attendanceForm.note}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, note: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {submitting ? 'Recording...' : 'Record Attendance'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Exam */}
          {activeTab === 'exam' && (
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={examForm.subjectId}
                    onChange={(e) => setExamForm({ ...examForm, subjectId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
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
                    value={examForm.examType}
                    onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  >
                    <option value="Midterm">Midterm Exam</option>
                    <option value="Final">Final Semester Exam</option>
                    <option value="Quiz">Surprise / Class Quiz</option>
                    <option value="Practical">Lab Practical Viva</option>
                    <option value="Unit Test">Unit Test</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={examForm.examDate}
                    onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={examForm.startTime}
                    onChange={(e) => setExamForm({ ...examForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={examForm.endTime}
                    onChange={(e) => setExamForm({ ...examForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Exam Venue / Hall
                </label>
                <input
                  type="text"
                  placeholder="e.g. Auditorium Hall 2"
                  value={examForm.venue}
                  onChange={(e) => setExamForm({ ...examForm, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {submitting ? 'Scheduling...' : 'Schedule Exam'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Note */}
          {activeTab === 'note' && (
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Key pointers for tomorrow's lab"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Link to Subject (Optional)
                </label>
                <select
                  value={noteForm.subjectId}
                  onChange={(e) => setNoteForm({ ...noteForm, subjectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                >
                  <option value="">General (No specific subject)</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Content *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write your study notes, formulas, pointers, or reminders..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="quickNoteFavorite"
                  checked={noteForm.isFavorite}
                  onChange={(e) => setNoteForm({ ...noteForm, isFavorite: e.target.checked })}
                  className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="quickNoteFavorite" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Mark as Favorite / Pinned Note
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
