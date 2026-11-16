import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Star,
  Edit2,
  Trash2,
  X,
  Tag,
  BookOpen,
  Calendar,
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [counts, setCounts] = useState({ total: 0, favorites: 0 });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    subjectId: '',
    isFavorite: false,
    tagsInput: '',
    color: '#ffffff'
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [deleteNoteItem, setDeleteNoteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const [notesRes, subjRes] = await Promise.all([
        api.get('/notes', {
          favorite: filterFavorite ? 'true' : undefined,
          subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
          search: search || undefined
        }),
        api.get('/subjects')
      ]);

      if (notesRes.success) {
        setNotes(notesRes.notes);
        if (notesRes.counts) setCounts(notesRes.counts);
      }
      if (subjRes.success) {
        setSubjects(subjRes.subjects);
      }
    } catch (err) {
      toast.error(err.message || 'Error loading notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [filterFavorite, selectedSubject, search]);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setForm({
      title: '',
      content: '',
      subjectId: '',
      isFavorite: false,
      tagsInput: '',
      color: '#ffffff'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setForm({
      title: note.title,
      content: note.content,
      subjectId: note.subjectId?._id || note.subjectId || '',
      isFavorite: note.isFavorite,
      tagsInput: Array.isArray(note.tags) ? note.tags.join(', ') : '',
      color: note.color || '#ffffff'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error('Please enter note title and content');
      return;
    }

    setSubmitting(true);
    const tags = form.tagsInput
      ? form.tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const payload = {
      title: form.title,
      content: form.content,
      subjectId: form.subjectId || null,
      isFavorite: form.isFavorite,
      tags,
      color: form.color
    };

    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote._id}`, payload);
        toast.success('Note updated successfully');
      } else {
        await api.post('/notes', payload);
        toast.success('Note created successfully');
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      toast.error(err.message || 'Failed to save note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFavorite = async (note) => {
    try {
      const res = await api.patch(`/notes/${note._id}/favorite`);
      if (res.success) {
        toast.info(res.note.isFavorite ? 'Added to favorites ⭐' : 'Removed from favorites');
        fetchNotes();
      }
    } catch (err) {
      toast.error('Error toggling favorite');
    }
  };

  const handleDelete = async () => {
    if (!deleteNoteItem) return;
    setDeleting(true);
    try {
      await api.delete(`/notes/${deleteNoteItem._id}`);
      toast.success('Note deleted');
      setDeleteNoteItem(null);
      fetchNotes();
    } catch (err) {
      toast.error('Failed to delete note');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Academic Notes Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personal study notes, revision cheat-sheets, formulas, and favorite bookmarks
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Note</span>
        </button>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterFavorite(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !filterFavorite
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Notes ({counts.total})
          </button>
          <button
            onClick={() => setFilterFavorite(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterFavorite
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Favorites ({counts.favorites})</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 sm:max-w-md sm:ml-auto">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes content or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Study Notes Found"
          description="You haven't written any notes matching this search. Capture formulas, lecture summaries, and reminders to study efficiently."
          actionLabel="Write Note"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => {
            const isFav = note.isFavorite;

            return (
              <div
                key={note._id}
                className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Subject Badge + Star Toggle */}
                  <div className="flex items-center justify-between mb-3">
                    {note.subjectId ? (
                      <span
                        className="text-xs font-mono font-bold px-2 py-0.5 rounded-md text-white"
                        style={{ backgroundColor: note.subjectId?.color || '#6366f1' }}
                      >
                        {note.subjectId?.code}
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        General
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleFavorite(note)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isFav
                            ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                        }`}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Note"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteNoteItem(note)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Content */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {note.title}
                  </h3>

                  <div className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed mb-4 line-clamp-6 bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 font-sans">
                    {note.content}
                  </div>
                </div>

                {/* Tags & Timestamp */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tg, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          #{tg}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>
                      Updated {new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    {note.subjectId?.name && (
                      <span className="truncate max-w-[140px]">{note.subjectId?.name}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingNote ? 'Edit Study Note' : 'Write Study Note'}
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
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Theorem & Recurrences Summary"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Link to Subject
                </label>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                >
                  <option value="">General (No subject selected)</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Note Content *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Type notes, algorithms, definitions, or reminders..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white resize-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="algorithms, midterm, formulas"
                  value={form.tagsInput}
                  onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="noteFavoriteCheck"
                  checked={form.isFavorite}
                  onChange={(e) => setForm({ ...form, isFavorite: e.target.checked })}
                  className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="noteFavoriteCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Bookmark as Favorite / Pinned Note
                </label>
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
                  {submitting ? 'Saving...' : editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteNoteItem}
        title="Delete Study Note?"
        message={`Are you sure you want to delete "${deleteNoteItem?.title}"?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteNoteItem(null)}
      />
    </div>
  );
};
