import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Users,
  CheckSquare,
  CalendarCheck,
  GraduationCap,
  FileText,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    semester: 'Semester 5',
    description: '',
    facultyName: '',
    credits: 3,
    color: '#3b82f6'
  });
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal state
  const [detailSubject, setDetailSubject] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('assignments');

  // Delete Dialog state
  const [deleteSubjectItem, setDeleteSubjectItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subjects', {
        search,
        semester: selectedSemester !== 'all' ? selectedSemester : undefined
      });
      if (res.success) {
        setSubjects(res.subjects);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [search, selectedSemester]);

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setForm({
      name: '',
      code: '',
      semester: 'Semester 5',
      description: '',
      facultyName: '',
      credits: 3,
      color: '#3b82f6'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subj) => {
    setEditingSubject(subj);
    setForm({
      name: subj.name,
      code: subj.code,
      semester: subj.semester || 'Semester 5',
      description: subj.description || '',
      facultyName: subj.facultyName || '',
      credits: subj.credits || 3,
      color: subj.color || '#3b82f6'
    });
    setIsModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      toast.error('Please enter subject name and code');
      return;
    }

    setSubmitting(true);
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject._id}`, form);
        toast.success('Subject updated successfully!');
      } else {
        await api.post('/subjects', form);
        toast.success('Subject created successfully!');
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err.message || 'Failed to save subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteSubjectItem) return;
    setDeleting(true);
    try {
      await api.delete(`/subjects/${deleteSubjectItem._id}`);
      toast.success('Subject and linked records deleted.');
      setDeleteSubjectItem(null);
      fetchSubjects();
    } catch (err) {
      toast.error(err.message || 'Failed to delete subject');
    } finally {
      setDeleting(false);
    }
  };

  // Open Subject Detailed Drill-Down
  const handleOpenDetail = async (subj) => {
    setDetailSubject(subj);
    setDetailLoading(true);
    try {
      const res = await api.get(`/subjects/${subj._id}`);
      if (res.success) {
        setDetailData(res);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load subject details');
    } finally {
      setDetailLoading(false);
    }
  };

  const colorOptions = [
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Purple', value: '#a855f7' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Subject Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize modules, faculty details, credits, and linked academic records
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by subject name, code, or faculty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
          >
            <option value="all">All Semesters</option>
            {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Subjects Found"
          description="You haven't added any subjects matching your filters yet. Add your core subjects to organize your classes, assignments, and exams."
          actionLabel="Add Subject"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subj) => {
            const stats = subj.stats || {};
            const attendancePct = stats.attendancePercentage ?? 100;

            return (
              <div
                key={subj._id}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code badge, Credits & Action Buttons */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: subj.color || '#3b82f6' }}
                      />
                      <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {subj.code}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {subj.credits} Credits
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(subj)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteSubjectItem(subj)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subject Name & Semester */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {subj.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{subj.facultyName || 'Faculty not assigned'}</span>
                  </p>

                  {subj.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {subj.description}
                    </p>
                  )}
                </div>

                {/* Bottom Stats & Drilldown Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">
                        {attendancePct}%
                      </span>
                      <span className="text-[10px] text-slate-400">Attendance</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">
                        {stats.pendingAssignments || 0}
                      </span>
                      <span className="text-[10px] text-slate-400">Pending</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">
                        {stats.upcomingExams || 0}
                      </span>
                      <span className="text-[10px] text-slate-400">Exams</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenDetail(subj)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition-colors"
                  >
                    <span>View Subject Hub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS503"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm uppercase focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  >
                    {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Tanenbaum"
                    value={form.facultyName}
                    onChange={(e) => setForm({ ...form, facultyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Credits (1 - 10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Accent Color Tag
                </label>
                <div className="flex items-center gap-3">
                  {colorOptions.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm({ ...form, color: c.value })}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        form.color === c.value ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110' : 'opacity-80'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Syllabus Outline
                </label>
                <textarea
                  rows={3}
                  placeholder="Topics covered, textbooks, reference materials..."
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
                  {submitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Detailed Hub Modal */}
      {detailSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: detailSubject.color }}
                  />
                  <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {detailSubject.code}
                  </span>
                  <span className="text-xs text-slate-400">
                    {detailSubject.semester}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {detailSubject.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Faculty: {detailSubject.facultyName} • {detailSubject.credits} Credits
                </p>
              </div>

              <button
                onClick={() => setDetailSubject(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hub Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-3 bg-slate-50/50 dark:bg-slate-950/30 text-xs font-bold">
              {[
                { id: 'assignments', label: 'Assignments', icon: CheckSquare },
                { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
                { id: 'exams', label: 'Exams', icon: GraduationCap },
                { id: 'notes', label: 'Notes', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = detailTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id)}
                    className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
                      active
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Hub Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {detailLoading ? (
                <div className="text-center py-8 text-xs text-slate-500">Loading details...</div>
              ) : (
                <>
                  {detailTab === 'assignments' && (
                    detailData?.assignments?.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No assignments linked to this subject.</p>
                    ) : (
                      detailData?.assignments?.map((a) => (
                        <div key={a._id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{a.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Due: {new Date(a.dueDate).toLocaleDateString()} • Priority: {a.priority}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {a.status}
                          </span>
                        </div>
                      ))
                    )
                  )}

                  {detailTab === 'attendance' && (
                    <div>
                      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 mb-4 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Subject Attendance</span>
                          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                            {detailData?.stats?.attendedClasses} of {detailData?.stats?.totalClasses} classes attended
                          </p>
                        </div>
                        <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                          {detailData?.stats?.attendancePercentage}%
                        </span>
                      </div>

                      <div className="space-y-2">
                        {detailData?.attendance?.slice(0, 8).map((att) => (
                          <div key={att._id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                            <span className="text-slate-600 dark:text-slate-400">
                              {new Date(att.date).toLocaleDateString()} {att.note && `(${att.note})`}
                            </span>
                            <span className={`font-bold px-2 py-0.5 rounded-md ${att.status === 'Present' ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                              {att.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailTab === 'exams' && (
                    detailData?.exams?.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No examinations scheduled for this subject.</p>
                    ) : (
                      detailData?.exams?.map((e) => (
                        <div key={e._id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600">{e.examType}</span>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{new Date(e.examDate).toLocaleDateString()} at {e.startTime}</h4>
                            <p className="text-[10px] text-slate-500">Venue: {e.venue}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {e.isCompleted ? 'Completed' : 'Upcoming'}
                          </span>
                        </div>
                      ))
                    )
                  )}

                  {detailTab === 'notes' && (
                    detailData?.notes?.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No study notes found for this subject.</p>
                    ) : (
                      detailData?.notes?.map((n) => (
                        <div key={n._id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">{n.title}</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{n.content}</p>
                        </div>
                      ))
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteSubjectItem}
        title={`Delete Subject "${deleteSubjectItem?.code}"?`}
        message="Deleting this subject will also safely clean up all linked assignments, attendance records, exam schedules, and notes for this subject. Are you sure you want to proceed?"
        confirmText="Yes, Delete Subject"
        loading={deleting}
        onConfirm={handleDeleteSubject}
        onCancel={() => setDeleteSubjectItem(null)}
      />
    </div>
  );
};
