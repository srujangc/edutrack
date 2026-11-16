# EduTrack – Student Academic Management Platform 🎓

A complete, modern, responsive full-stack web application built to help college students manage their entire academic life in one unified place. Organize course subjects, assignments, attendance targets, weekly timetables, exam countdowns, study notes, and visual academic progress analytics.

---

## 🌟 Key Features & Modules

### 1. 📊 Executive Dashboard
- **Aggregate Academic KPI Cards**: Quick view of total subjects, overall attendance %, pending vs completed assignments, and upcoming exam count.
- **Today's Class Schedule**: Dynamic timetable preview highlighting current day's classes, classrooms, faculty, and timings.
- **Deadlines Approaching**: Priority-tagged assignment deadlines with remaining day countdowns and urgency alerts.
- **Examination Countdowns**: Live countdown clocks (days and hours left) for upcoming midterms and finals.
- **Recent Activities Feed**: Chronological stream of recent class attendance marks, submitted assignments, and study notes.
- **Global Quick-Add**: Modal accessible from anywhere to log attendance, create assignments, schedule exams, or write notes in seconds.

### 2. 📚 Subject Management
- Full CRUD capabilities: Add, edit, and delete subjects with unique subject codes (e.g. `CS501`), semester, descriptions, faculty names, credit hours, and color tags.
- **Search & Semester Filter**: Instant filter by name, code, faculty, or semester.
- **Subject Hub Drill-Down**: Dedicated hub for each subject displaying all linked assignments, attendance records, scheduled exams, and notes.
- **Cascading Integrity**: Clean cascading deletion of linked tasks, attendance logs, notes, and exams when a subject is deleted.

### 3. 📝 Assignment & Task Tracker
- Comprehensive management: Title, subject, description, due date, priority levels (*High, Medium, Low*), and total marks.
- **Interactive Status Toggle**: Checkbox with celebration confetti animation upon completing an assignment.
- **Filter Tabs**: Separate views for *All*, *Pending*, *Overdue*, and *Completed* tasks with live count badges.
- **Urgency Indicators**: Color-coded deadline tags (Overdue in red, Due Today/Tomorrow in amber, Safe in emerald).
- **Multi-criteria Sorting**: Sort by earliest due date, latest due date, or title.

### 4. 🛡️ Attendance Intelligence & Predictor
- Record attendance per subject as **Present**, **Absent**, or **Excused**.
- Automatic calculation of attendance percentage against a customizable target threshold (default: **75%**).
- **Academic Predictor Formula**:
  - **Consecutive Classes Calculator**: Calculates exactly how many consecutive upcoming classes a student must attend to reach their target percentage:
    $$\text{Classes Needed} = \left\lceil \frac{T \cdot N - 100 \cdot P}{100 - T} \right\rceil$$
  - **Absence Margin (Bunk Safety Calculator)**: Calculates how many classes a student can safely miss without dropping below the target threshold:
    $$\text{Safe to Miss} = \left\lfloor \frac{100 \cdot P - T \cdot N}{T} \right\rfloor$$
- **1-Click Quick Logging**: Instant `+ Present`, `+ Absent`, and `+ Leave` buttons on every subject card.
- **Full History Log**: Filterable by subject and status with delete/edit capabilities.

### 5. 🗓️ Smart Weekly Timetable
- Weekly grid matrix (*Monday through Sunday*) with period start/end times and classroom venues.
- **Today's Classes Highlight**: Visual indicators highlighting today's ongoing schedule.
- **Overlap & Schedule Conflict Protection**: Intelligent algorithm that prevents double-booking a student into two classes simultaneously on the same day.

### 6. 🏆 Examination Center & Scorecard
- Schedule examinations with subject, exam date, start/end time, venue, exam type (*Midterm, Final, Quiz, Practical, Unit Test*), and syllabus outline.
- **Live Countdowns**: Real-time remaining days and hours calculation.
- **Completed vs Upcoming Separation**: Filter tabs for scheduled exams vs graded exams.
- **Auto-grading Engine**: Enter obtained marks on completion to automatically calculate grade (*A+, A, B, C, D, F*) and percentage.

### 7. 📓 Academic Notes Hub
- Create, edit, and organize lecture notes with full-text search across titles, contents, and hashtags.
- **Favorite & Pinned Notes**: Star important formulas and cheat-sheets for quick revision.
- Subject-linking and date timestamps.

### 8. 📈 Academic Progress & Analytics
- **Visual Recharts Data**:
  - Subject Attendance vs Target Threshold (with reference threshold line).
  - Assignment Completion Distribution (interactive donut chart).
  - Exam Score Trajectory (bar chart across quizzes, midterms, and finals).
  - Subject-wise Assignment Completion Rates.

### 9. ⚙️ Profile & System Settings
- Edit student name, college/university, semester, department, roll number, and default attendance target.
- Secure password change with bcrypt verification.
- **Light / Dark Mode Toggle** with persistent preference storage.
- **1-Click Demonstration Dataset**: Populate realistic engineering courses, assignments, attendance logs, timetables, and exams in one click.
- **Data Reset**: Wipe data to experience clean, fresh student onboarding empty states.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite.js, Tailwind CSS, Lucide React, Recharts, Canvas-Confetti |
| **Backend** | Node.js, Express.js (ES Modules), Mongoose, JWT, bcryptjs, CORS |
| **Database** | MongoDB (Native Mongoose ODM with automated zero-config fallback) |
| **Security** | bcrypt password hashing, JWT Bearer authentication, User-data isolation middleware |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- Optional: Local MongoDB Server (or MongoDB Atlas URI)

### 1. Clone or Open Workspace
```bash
cd "education website"
```

### 2. Install All Dependencies
```bash
npm run install:all
```
*(Or navigate to `backend/` and `frontend/` individually and run `npm install`)*

### 3. Environment Configuration
Copy the provided `.env.example` in `backend/`:
```bash
cp backend/.env.example backend/.env
```
Default `.env` values are pre-configured:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/edutrack
JWT_SECRET=edutrack_jwt_secret_key_982347293847293847293847
JWT_EXPIRE=7d
NODE_ENV=development
```

### 4. Run Both Backend & Frontend Simultaneously
From the root directory:
```bash
npm run dev
```

- **Backend API**: `http://localhost:5000`
- **Frontend Web App**: `http://localhost:5173`

---

## 🔑 Demo Login Credentials

For instant demonstration and evaluation:
- **Email**: `alex.rivera@college.edu`
- **Password**: `Password123!`
*(You can also click the **"Auto-Fill Demo"** button on the Login page!)*

Or click **"1-Click Load Realistic Demo Data"** inside **Settings** to populate 5 courses, 7 assignments, 90 attendance records, weekly timetable, and midterms.

---

## 🧪 Automated API Test Suite
Run the backend automated test suite verifying all 11 endpoints and Mongoose models:
```bash
npm test
```

---

## 📱 Responsive Testing
The user interface is designed and tested for all responsive viewports:
- **Mobile Phones (360px – 420px)**: Bottom navigation bar, adaptive cards, responsive tables.
- **Tablets (768px – 1024px)**: Collapsible sidebar, adaptive multi-column grids.
- **Laptops & Desktops (1280px – 1920px)**: Full multi-column dashboard, side-by-side matrices, and high information density.

---

## 🌐 Production Deployment Instructions

### Deploying Frontend (Vercel / Netlify)
1. Push the code to GitHub/GitLab.
2. In Vercel or Netlify, select the `frontend/` directory as the Root Directory.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set environment variable: `VITE_API_URL=https://your-backend-api.onrender.com/api`

### Deploying Backend (Render / Railway / DigitalOcean)
1. Select the `backend/` directory as Root Directory.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Set environment variables:
   - `PORT=5000`
   - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/edutrack`
   - `JWT_SECRET=your_production_secret_key`
   - `NODE_ENV=production`
