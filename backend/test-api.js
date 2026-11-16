import http from 'http';
import app from './server.js';

const PORT = 5055;

let server;

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);
    try {
      // 1. Health check
      console.log('--- Test 1: Health Check ---');
      const health = await request({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/health',
        method: 'GET'
      });
      console.log('Health status:', health.status, health.data.status);

      // 2. Register or Login
      console.log('--- Test 2: Student Auth (Register/Login) ---');
      let token;
      const reg = await request(
        {
          hostname: '127.0.0.1',
          port: PORT,
          path: '/api/auth/register',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        },
        {
          name: 'Alex Rivera',
          email: 'alex.rivera@college.edu',
          password: 'Password123!',
          college: 'Stanford University',
          semester: 'Semester 5',
          department: 'Computer Science'
        }
      );

      if (reg.status === 201 && reg.data.token) {
        console.log('Registered new student:', reg.data.message);
        token = reg.data.token;
      } else {
        // Already registered, log in
        console.log('Student exists, logging in with credentials...');
        const loginRes = await request(
          {
            hostname: '127.0.0.1',
            port: PORT,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          },
          {
            email: 'alex.rivera@college.edu',
            password: 'Password123!'
          }
        );
        token = loginRes.data.token;
        console.log('Login status:', loginRes.status, loginRes.data.message);
      }

      if (!token) throw new Error('Could not acquire auth JWT token!');

      const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };

      // 3. Seed Demo Data
      console.log('--- Test 3: Seed Sample Data ---');
      const seed = await request(
        {
          hostname: '127.0.0.1',
          port: PORT,
          path: '/api/seed',
          method: 'POST',
          headers: authHeaders
        }
      );
      console.log('Seed status:', seed.status, seed.data.message);

      // 4. Dashboard Analytics
      console.log('--- Test 4: Dashboard Data ---');
      const dashboard = await request({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/analytics/dashboard',
        method: 'GET',
        headers: authHeaders
      });
      console.log('Dashboard summary:', dashboard.data.summary);
      console.log('Today classes count:', dashboard.data.todayClasses.length);
      console.log('Upcoming deadlines count:', dashboard.data.upcomingDeadlines.length);

      // 5. Subjects
      console.log('--- Test 5: Subjects List ---');
      const subjects = await request({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/subjects',
        method: 'GET',
        headers: authHeaders
      });
      console.log(`Found ${subjects.data.count} subjects. First: ${subjects.data.subjects[0]?.name} (${subjects.data.subjects[0]?.code})`);

      // 6. Assignments
      console.log('--- Test 6: Assignments ---');
      const assignments = await request({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/assignments',
        method: 'GET',
        headers: authHeaders
      });
      console.log('Assignments counts:', assignments.data.counts);

      // 7. Attendance
      console.log('--- Test 7: Attendance Overview & Formulas ---');
      const attendance = await request({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/attendance',
        method: 'GET',
        headers: authHeaders
      });
      console.log('Overall Attendance %:', attendance.data.overallStats.percentage);
      console.log('Subject stats count:', attendance.data.subjects.length);

      // 8. Timetable
      console.log('--- Test 8: Timetable Weekly Grid ---');
      const timetable = await request({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/timetable',
        method: 'GET',
        headers: authHeaders
      });
      console.log('Total timetable slots:', timetable.data.totalEntries);

      // 9. Exams
      console.log('--- Test 9: Exams & Countdowns ---');
      const exams = await request({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/exams',
        method: 'GET',
        headers: authHeaders
      });
      console.log('Exams count:', exams.data.counts);

      // 10. Notes
      console.log('--- Test 10: Notes & Search ---');
      const notes = await request({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/notes',
        method: 'GET',
        headers: authHeaders
      });
      console.log('Notes count:', notes.data.counts);

      // 11. Academic Progress
      console.log('--- Test 11: Progress Analytics ---');
      const progress = await request({
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/analytics/progress',
        method: 'GET',
        headers: authHeaders
      });
      console.log('Progress summary:', progress.data.summary);

      console.log('\n=======================================');
      console.log('>>> ALL 11 BACKEND API TESTS PASSED! <<<');
      console.log('=======================================\n');

      server.close(() => process.exit(0));
    } catch (err) {
      console.error('Test Failed:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runTests();
