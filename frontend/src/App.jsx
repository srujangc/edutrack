import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { TimetablePage } from './pages/TimetablePage';
import { ExamsPage } from './pages/ExamsPage';
import { NotesPage } from './pages/NotesPage';
import { AcademicProgressPage } from './pages/AcademicProgressPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Student Dashboard App Routes */}
            <Route path="/app" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="subjects" element={<SubjectsPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="exams" element={<ExamsPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="progress" element={<AcademicProgressPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
