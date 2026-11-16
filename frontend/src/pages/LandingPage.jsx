import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  BookOpen,
  CheckSquare,
  CalendarCheck,
  CalendarDays,
  TrendingUp,
  FileText,
  Clock,
  Sparkles,
  Shield,
  Zap,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async () => {
    // Quick demo login or redirect
    const res = await login('alex.rivera@college.edu', 'Password123!');
    if (res.success) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                EduTrack
              </span>
              <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 -mt-1 uppercase tracking-wider">
                Student Academic Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/app"
                className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Built Specifically For College Students</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
            Master your entire academic life in{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
              one unified place.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Eliminate missed deadlines, attendance panic, and exam anxiety. Organize your subjects, calculate classes needed for 75% attendance, track assignments, and view your schedule at a glance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-14">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleQuickDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl transition-all"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>One-Click Demo Sign-in</span>
            </button>
          </div>

          {/* Interactive Reference Preview Card */}
          <div className="relative mx-auto max-w-4xl p-3 sm:p-5 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-3xl sm:rounded-4xl shadow-2xl backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-left">
              {/* Card 1 */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-indigo-100">Overall Attendance</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20">Target: 75%</span>
                </div>
                <div className="text-3xl font-extrabold mb-1">81%</div>
                <p className="text-xs text-indigo-100">Safe margin: You can safely miss 2 more classes in CS501.</p>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Next Upcoming Exam</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">In 4 Days</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">DSA (CS501) Midterm</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Main Academic Auditorium • 10:00 AM</p>
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Tasks</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">5 Active</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">Red-Black Tree Code</div>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">Due in 2 days (High Priority)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">
              Engineered For Academic Excellence
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Everything college students need to stay on top
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: CalendarCheck,
                color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50',
                title: 'Attendance Target Predictor',
                desc: 'Know exactly how many consecutive classes you must attend to reach 75%, and how many classes you can safely skip without falling short.'
              },
              {
                icon: CheckSquare,
                color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50',
                title: 'Deadlines & Assignment Tracker',
                desc: 'Categorize assignments by priority and urgency. Auto-calculate remaining days and celebrate completed submissions with confetti.'
              },
              {
                icon: CalendarDays,
                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
                title: 'Smart Weekly Timetable',
                desc: 'Weekly visual matrix highlighting today’s ongoing schedule with built-in schedule conflict and overlap detection.'
              },
              {
                icon: GraduationCap,
                color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50',
                title: 'Exams & Live Countdowns',
                desc: 'Keep track of midterms, quizzes, and finals with real-time countdown clocks, venue locations, and automatic grade calculators.'
              },
              {
                icon: BookOpen,
                color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50',
                title: 'Subject Intelligence',
                desc: 'Centralize faculty details, syllabus description, and linked assignments, attendance logs, and notes per subject.'
              },
              {
                icon: TrendingUp,
                color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50',
                title: 'Academic Analytics & Charts',
                desc: 'Visual charts analyzing attendance patterns, completion rates, and subject-wise score distribution over the semester.'
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${feature.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Get running in 4 easy steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Register Account', desc: 'Sign up with your college and semester in under 20 seconds.' },
              { step: '02', title: 'Set Up Subjects', desc: 'Add your subjects or use 1-click sample data in Settings.' },
              { step: '03', title: 'Log Daily Classes', desc: 'Mark Present or Absent in 1 click and keep track of your 75% target.' },
              { step: '04', title: 'Crush Deadlines', desc: 'Track assignments and ace midterms with live countdown timers.' },
            ].map((step, i) => (
              <div key={i} className="text-center p-4">
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-2 font-mono">
                  {step.step}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Take complete control of your college journey today.
          </h2>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto mb-8">
            Free forever for students. Fast, responsive, private, and fully customizable.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-indigo-600 bg-white hover:bg-slate-100 rounded-2xl shadow-xl transition-all"
          >
            <span>Create Your Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} EduTrack Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};
