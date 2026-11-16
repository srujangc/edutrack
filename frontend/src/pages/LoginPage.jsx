import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Invalid email or password');
    }
  };

  const handleFillDemo = () => {
    setEmail('alex.rivera@college.edu');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link to="/" className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
            <GraduationCap className="w-7 h-7" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Welcome to EduTrack
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log in to access your student academic dashboard
          </p>
        </div>

        {/* Demo Fast Sign-in Pill */}
        <div className="p-3 mb-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Quick test credentials</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Auto-Fill Demo
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              College Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};
