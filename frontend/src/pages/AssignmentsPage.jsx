import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, completed: 0, overdue: 0 });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusTab, setStatusTab] = useState('All'); // 'All', 'Pending', 'Overdue', 'Completed'
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline-asc');
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    title: '',
    subjectId: '',
    description: '',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    priority: 'Medium',
    totalMarks: 100
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assnRes, subjRes] = await Promise.all([
        api.get('/assignments', {
          status: statusTab !== 'All' ? statusTab : undefined,
          subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
          sortBy: sortBy === 'deadline-asc' ? undefined : sortBy,
          search: search || undefined
        }),
        api.get('/subjects')
      ]);

      if (assnRes.success) {
        setAssignments(assnRes.assignments);
        if (assnRes.counts) setCounts(assnRes.counts);
      }
      if (subjRes.success) {
        setSubjects(subjRes.subjects);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusTab, subjectFilter, priorityFilter, sortBy, search]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      title: '',
      subjectId: subjects.length > 0 ? subjects[0]._id : '',
      description: '',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      priority: 'Medium',
      totalMarks: 100
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      subjectId: item.subjectId?._id || item.subjectId || '',
      description: item.description || '',
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
      priority: item.priority || 'Medium',
      totalMarks: item.totalMarks || 100
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subjectId || !form.dueDate) {
      toast.error('Please enter title, subject, and deadline');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/assignments/${editingItem._id}`, form);
        toast.success('Assignment updated successfully!');
      } else {
        await api.post('/assignments', form);
        toast.success('Assignment created successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to save assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const res = await api.patch(`/assignments/${item._id}/toggle`);
      if (res.success) {
        if (res.assignment.status === 'Completed') {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 }
          });
          toast.success(`🎉 Great job! "${item.title}" marked completed.`);
        } else {
          toast.info(`Marked "${item.title}" as pending.`);
        }
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Error updating status');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await api.delete(`/assignments/${deleteItem._id}`);
      toast.success('Assignment deleted successfully');
      setDeleteItem(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete assignment');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Assignment Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track submissions, priorities, overdue deadlines, and progress
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'All', label: 'All Tasks', count: counts.total },
          { id: 'Pending', label: 'Pending', count: counts.pending },
          { id: 'Overdue', label: 'Overdue', count: counts.overdue, danger: counts.overdue > 0 },
          { id: 'Completed', label: 'Completed', count: counts.completed },
        ].map((tab) => {
          const active = statusTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  active
                    ? 'bg-white/25 text-white'
                    : tab.danger
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Subject Filter */}
        <div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
          >
            <option value="all">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
          >
            <option value="deadline-asc">Sort: Earliest Due Date</option>
            <option value="deadline-desc">Sort: Latest Due Date</option>
            <option value="title">Sort: Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Assignments List Cards */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No Assignments Found"
          description="You don't have any assignments matching this criteria. Create a new assignment to keep track of college projects and submissions."
          actionLabel="Create Assignment"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((item) => {
            const isDone = item.status === 'Completed';
            const days = item.daysRemaining;
            const isOverdue = item.isOverdue;

            return (
              <div
                key={item._id}
                className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDone
                    ? 'border-slate-200/60 dark:border-slate-800/60 opacity-80'
                    : isOverdue
                    ? 'border-rose-200 dark:border-rose-900/50 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800/60'
                }`}
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                    }`}
                    title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md text-white"
                        style={{ backgroundColor: item.subjectId?.color || '#6366f1' }}
                      >
                        {item.subjectId?.code || 'CS'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {item.subjectId?.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.priority === 'High'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : item.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                    </div>

                    <h3
                      className={`text-sm sm:text-base font-bold ${
                        isDone
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Deadline Badge & Action Buttons */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col md:items-end">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <span
                      className={`text-[11px] font-bold mt-1 px-2.5 py-0.5 rounded-full ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse'
                          : days <= 2
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {isDone
                        ? 'Completed'
                        : isOverdue
                        ? `Overdue by ${Math.abs(days)}d`
                        : days === 0
                        ? 'Due Today'
                        : `${days} days left`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      title="Edit Assignment"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      title="Delete Assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingItem ? 'Edit Assignment' : 'New Assignment'}
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
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Red-Black Tree"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                />
              </div>

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
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={form.totalMarks}
                    onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Submission instructions, repository link, or reference rubric..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
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
                  {submitting ? 'Saving...' : editingItem ? 'Update Assignment' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        title="Delete Assignment?"
        message={`Are you sure you want to delete "${deleteItem?.title}"?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
};
