import React, { useState } from 'react';
import {
  User,
  Lock,
  Moon,
  Sun,
  Shield,
  LogOut,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building,
  GraduationCap
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const SettingsPage = () => {
  const { user, updateProfile, theme, toggleTheme, logout } = useAuth();
  const toast = useToast();

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    college: user?.college || '',
    semester: user?.semester || 'Semester 5',
    department: user?.department || '',
    rollNumber: user?.rollNumber || '',
    targetAttendance: user?.targetAttendance || 75
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Demo Data & Reset Data state
  const [seeding, setSeeding] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile(profileForm);
    setSavingProfile(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (res.success) {
        toast.success('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLoadDemoData = async () => {
    setSeeding(true);
    try {
      const res = await api.post('/seed');
      if (res.success) {
        toast.success('🎉 Sample academic dataset loaded! 5 subjects, assignments, attendance, timetable, exams, and notes populated.');
        // Trigger global data refresh event
        window.dispatchEvent(new CustomEvent('edutrack-data-refresh'));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load sample data');
    } finally {
      setSeeding(false);
    }
  };

  const handleResetData = async () => {
    setResetting(true);
    try {
      const res = await api.delete('/seed/reset');
      if (res.success) {
        toast.info('All academic data safely cleared. You now have a blank slate.');
        setResetDialogOpen(false);
        window.dispatchEvent(new CustomEvent('edutrack-data-refresh'));
      }
    } catch (err) {
      toast.error('Failed to reset data');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Profile & System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, academic preferences, security credentials, and demo data
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Student Profile Information
            </h2>
            <p className="text-xs text-slate-400">
              Update your registered college credentials and current semester
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                College / University
              </label>
              <input
                type="text"
                value={profileForm.college}
                onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current Semester
              </label>
              <select
                value={profileForm.semester}
                onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
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
                Department / Major
              </label>
              <input
                type="text"
                value={profileForm.department}
                onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Roll Number / Student ID
              </label>
              <input
                type="text"
                value={profileForm.rollNumber}
                onChange={(e) => setProfileForm({ ...profileForm, rollNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Minimum Attendance Target Percentage (%)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={profileForm.targetAttendance}
                onChange={(e) => setProfileForm({ ...profileForm, targetAttendance: Number(e.target.value) })}
                className="flex-1 accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 w-12 text-right">
                {profileForm.targetAttendance}%
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
            >
              {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Theme & Display Preferences */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Interface Theme
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch between Light mode and Dark mode
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-500 transition-colors"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Security & Password Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Change Password
            </h2>
            <p className="text-xs text-slate-400">
              Ensure your account is protected with a strong password
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Password (min 6 chars)
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-all"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Developer & Evaluation Sample Data Actions */}
      <div className="p-6 bg-gradient-to-br from-indigo-50/60 to-blue-50/60 dark:from-slate-900 dark:to-slate-900 rounded-3xl border border-indigo-100 dark:border-slate-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Demonstration & Evaluation Tools</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quickly test the platform with complete realistic engineering sample datasets or reset to a blank canvas to test empty states.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleLoadDemoData}
            disabled={seeding}
            className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{seeding ? 'Generating Sample Dataset...' : '1-Click Load Realistic Demo Data'}</span>
          </button>

          <button
            onClick={() => setResetDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset / Wipe Academic Data</span>
          </button>
        </div>
      </div>

      {/* Sign Out Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-rose-600 dark:text-rose-400">
            Sign Out of Account
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log out from this browser session securely
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Reset Data Confirmation */}
      <ConfirmDialog
        isOpen={resetDialogOpen}
        title="Reset All Academic Records?"
        message="This will permanently clear all your registered subjects, assignments, attendance records, timetable slots, exams, and notes so you can test empty states from scratch."
        confirmText="Yes, Wipe All Data"
        loading={resetting}
        onConfirm={handleResetData}
        onCancel={() => setResetDialogOpen(false)}
      />
    </div>
  );
};
