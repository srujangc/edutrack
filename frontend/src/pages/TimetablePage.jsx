import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Calendar,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const TimetablePage = () => {
  const [timetable, setTimetable] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Identify today
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];

  const [activeDay, setActiveDay] = useState(todayName === 'Sunday' ? 'Monday' : todayName);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [form, setForm] = useState({
    subjectId: '',
    day: 'Monday',
    classroom: 'Hall 101',
    startTime: '09:00',
    endTime: '10:30',
    note: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const [tableRes, subjRes] = await Promise.all([
        api.get('/timetable'),
        api.get('/subjects')
      ]);

      if (tableRes.success) {
        setTimetable(tableRes);
      }
      if (subjRes.success) {
        setSubjects(subjRes.subjects);
      }
    } catch (err) {
      toast.error(err.message || 'Error fetching timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const handleOpenCreate = (targetDay) => {
    setEditingEntry(null);
    setForm({
      subjectId: subjects.length > 0 ? subjects[0]._id : '',
      day: targetDay || activeDay || 'Monday',
      classroom: 'Hall 101',
      startTime: '09:00',
      endTime: '10:30',
      note: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setForm({
      subjectId: entry.subjectId?._id || entry.subjectId || '',
      day: entry.day,
      classroom: entry.classroom || '',
      startTime: entry.startTime,
      endTime: entry.endTime,
      note: entry.note || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.subjectId || !form.startTime || !form.endTime) {
      toast.error('Please enter all required fields');
      return;
    }

    setSubmitting(true);
    try {
      if (editingEntry) {
        await api.put(`/timetable/${editingEntry._id}`, form);
        toast.success('Class schedule updated successfully');
      } else {
        await api.post('/timetable', form);
        toast.success('Class added to weekly timetable');
      }
      setIsModalOpen(false);
      fetchTimetable();
    } catch (err) {
      toast.error(err.message || 'Schedule conflict or validation error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteEntry) return;
    setDeleting(true);
    try {
      await api.delete(`/timetable/${deleteEntry._id}`);
      toast.success('Class slot removed');
      setDeleteEntry(null);
      fetchTimetable();
    } catch (err) {
      toast.error(err.message || 'Failed to remove timetable slot');
    } finally {
      setDeleting(false);
    }
  };

  const dayEntries = timetable?.weeklyGrid?.[activeDay] || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Weekly Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Weekly schedule matrix, period timings, venues, and conflict protection
          </p>
        </div>

        <button
          onClick={() => handleOpenCreate(activeDay)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class Slot</span>
        </button>
      </div>

      {/* Days Tabs (Mon - Sun) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {daysOfWeek.map((day) => {
          const isToday = day === todayName;
          const isActive = day === activeDay;
          const count = timetable?.weeklyGrid?.[day]?.length || 0;

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md uppercase tracking-wider ${isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
                  Today
                </span>
              )}
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Day Classes Timeline */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{activeDay}'s Schedule</span>
              {activeDay === todayName && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Live Today
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {dayEntries.length} class session{dayEntries.length === 1 ? '' : 's'} scheduled
            </p>
          </div>

          <button
            onClick={() => handleOpenCreate(activeDay)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slot for {activeDay}</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : dayEntries.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={`No Classes Scheduled for ${activeDay}`}
            description={`You don't have any periods booked for ${activeDay}. Add subject slots or relax on free periods!`}
            actionLabel={`Schedule Class on ${activeDay}`}
            onAction={() => handleOpenCreate(activeDay)}
          />
        ) : (
          <div className="space-y-3">
            {dayEntries.map((slot) => (
              <div
                key={slot._id}
                className="group p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-200 dark:hover:border-indigo-800/60 transition-all"
              >
                {/* Time & Subject */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs shrink-0 w-28 text-center">
                    <span className="text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                      {slot.startTime}
                    </span>
                    <span className="text-[10px] text-slate-400">to</span>
                    <span className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-300">
                      {slot.endTime}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: slot.subjectId?.color || '#3b82f6' }}
                      />
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {slot.subjectId?.code || 'CS'}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {slot.subjectId?.name || 'Class'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {slot.classroom}
                      </span>
                      {slot.subjectId?.facultyName && (
                        <span>• {slot.subjectId?.facultyName}</span>
                      )}
                      {slot.note && (
                        <span className="italic text-slate-400">({slot.note})</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEdit(slot)}
                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    title="Edit Slot"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteEntry(slot)}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    title="Delete Slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Timetable Modal with Conflict Check */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingEntry ? 'Edit Class Slot' : 'Add Class Schedule'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Day of Week *
                  </label>
                  <select
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Room / Lab *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hall 102"
                    value={form.classroom}
                    onChange={(e) => setForm({ ...form, classroom: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Slot Note / Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bring lab coat and pen drive"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
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
                  {submitting ? 'Checking Overlaps...' : editingEntry ? 'Update Slot' : 'Save Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteEntry}
        title="Remove Class from Timetable?"
        message={`Are you sure you want to remove this ${deleteEntry?.startTime} - ${deleteEntry?.endTime} class?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteEntry(null)}
      />
    </div>
  );
};
