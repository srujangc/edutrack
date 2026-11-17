import Subject from '../models/Subject.js';
import Assignment from '../models/Assignment.js';
import Attendance from '../models/Attendance.js';
import Timetable from '../models/Timetable.js';
import Exam from '../models/Exam.js';
import Note from '../models/Note.js';
import User from '../models/User.js';

// Reusable function to populate sample academic data for any student
export const populateStudentData = async (userId) => {
  try {
  // Remove existing data for this user to avoid conflicts or duplicates
  await Promise.all([
    Subject.deleteMany({ userId }),
    Assignment.deleteMany({ userId }),
    Attendance.deleteMany({ userId }),
    Timetable.deleteMany({ userId }),
    Exam.deleteMany({ userId }),
    Note.deleteMany({ userId })
  ]);

    // 1. Create 5 Realistic Core Subjects
    const sampleSubjects = [
      {
        userId,
        name: 'Data Structures & Algorithms',
        code: 'CS501',
        semester: 'Semester 5',
        description: 'Advanced graph algorithms, dynamic programming, tree traversals, and amortized complexity.',
        facultyName: 'Dr. Robert Sedgewick',
        color: '#3b82f6', // Blue
        credits: 4
      },
      {
        userId,
        name: 'Database Management Systems',
        code: 'CS502',
        semester: 'Semester 5',
        description: 'Relational algebra, normalization, query optimization, transaction management, and NoSQL architecture.',
        facultyName: 'Prof. Jennifer Widom',
        color: '#6366f1', // Indigo
        credits: 4
      },
      {
        userId,
        name: 'Operating Systems & Architecture',
        code: 'CS503',
        semester: 'Semester 5',
        description: 'Process synchronization, virtual memory paging, CPU scheduling algorithms, and file systems.',
        facultyName: 'Dr. Andrew Tanenbaum',
        color: '#10b981', // Emerald
        credits: 4
      },
      {
        userId,
        name: 'Computer Networks',
        code: 'CS504',
        semester: 'Semester 5',
        description: 'OSI & TCP/IP stack, routing protocols, flow control, socket programming, and wireless networks.',
        facultyName: 'Prof. Larry Peterson',
        color: '#f59e0b', // Amber
        credits: 3
      },
      {
        userId,
        name: 'Software Engineering & Agile',
        code: 'CS505',
        semester: 'Semester 5',
        description: 'SDLC methodologies, design patterns, microservices architecture, and CI/CD pipelines.',
        facultyName: 'Dr. Martin Fowler',
        color: '#ec4899', // Pink
        credits: 3
      }
    ];

    const createdSubjects = await Subject.insertMany(sampleSubjects);
    const [dsa, dbms, os, cn, se] = createdSubjects;

    // Current Date references
    const now = new Date();
    const addDays = (d, days) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
    const subDays = (d, days) => new Date(d.getTime() - days * 24 * 60 * 60 * 1000);

    // 2. Create Realistic Assignments (Pending, Overdue, and Completed)
    const sampleAssignments = [
      {
        userId,
        subjectId: dsa._id,
        title: 'Implement Red-Black Tree Balancing & Traversals',
        description: 'Write complete C++/Java code for insertion, deletion, and rotation cases in a Red-Black tree with automated unit tests.',
        dueDate: addDays(now, 2),
        priority: 'High',
        status: 'Pending',
        totalMarks: 100
      },
      {
        userId,
        subjectId: dbms._id,
        title: 'B+ Tree Indexing & Query Optimization Benchmark',
        description: 'Analyze execution plans for 5 complex nested SQL joins and measure performance differences with indexing.',
        dueDate: addDays(now, 5),
        priority: 'Medium',
        status: 'Pending',
        totalMarks: 50
      },
      {
        userId,
        subjectId: os._id,
        title: 'Round Robin & Multilevel Feedback Queue Simulator',
        description: 'Build a process scheduler simulation in C or Python calculating waiting time, turnaround time, and context switch overhead.',
        dueDate: subDays(now, 1), // Overdue!
        priority: 'High',
        status: 'Pending',
        totalMarks: 100
      },
      {
        userId,
        subjectId: cn._id,
        title: 'Packet Sniffing & Wireshark Protocol Analysis',
        description: 'Capture TCP 3-way handshakes, analyze DNS resolution packets, and submit an annotated PDF report.',
        dueDate: addDays(now, 9),
        priority: 'Low',
        status: 'Pending',
        totalMarks: 50
      },
      {
        userId,
        subjectId: se._id,
        title: 'Design Pattern Refactoring: Observer & Factory',
        description: 'Refactor monolithic order processing module into decoupled behavioral and creational design patterns.',
        dueDate: addDays(now, 14),
        priority: 'Medium',
        status: 'Pending',
        totalMarks: 100
      },
      {
        userId,
        subjectId: dsa._id,
        title: 'Dynamic Programming: Knapsack & Matrix Chain',
        description: 'Submitted solution with memoization and bottom-up DP table comparison.',
        dueDate: subDays(now, 6),
        priority: 'High',
        status: 'Completed',
        completedAt: subDays(now, 6),
        totalMarks: 100,
        obtainedMarks: 94
      },
      {
        userId,
        subjectId: dbms._id,
        title: 'Normalization Case Study (1NF to BCNF)',
        description: 'Decomposed hospital database schema avoiding insertion, deletion, and update anomalies.',
        dueDate: subDays(now, 10),
        priority: 'Medium',
        status: 'Completed',
        completedAt: subDays(now, 11),
        totalMarks: 50,
        obtainedMarks: 48
      }
    ];

    await Assignment.insertMany(sampleAssignments);

    // 3. Create Attendance Records for Each Subject
    const attendanceRecords = [];
    const subjectsArray = [
      { subj: dsa, presentCount: 16, absentCount: 2, excusedCount: 1 },
      { subj: dbms, presentCount: 15, absentCount: 3, excusedCount: 0 },
      { subj: os, presentCount: 11, absentCount: 6, excusedCount: 1 }, // Low attendance (~61%) to trigger warning!
      { subj: cn, presentCount: 14, absentCount: 2, excusedCount: 1 },
      { subj: se, presentCount: 17, absentCount: 1, excusedCount: 0 }
    ];

    subjectsArray.forEach(({ subj, presentCount, absentCount, excusedCount }) => {
      let dayCounter = 1;
      for (let i = 0; i < presentCount; i++) {
        attendanceRecords.push({
          userId,
          subjectId: subj._id,
          date: subDays(now, dayCounter * 2),
          status: 'Present',
          note: `Lecture on Unit ${Math.floor(i / 4) + 1}`
        });
        dayCounter++;
      }
      for (let i = 0; i < absentCount; i++) {
        attendanceRecords.push({
          userId,
          subjectId: subj._id,
          date: subDays(now, dayCounter * 2 + 1),
          status: 'Absent',
          note: 'Missed class'
        });
        dayCounter++;
      }
      for (let i = 0; i < excusedCount; i++) {
        attendanceRecords.push({
          userId,
          subjectId: subj._id,
          date: subDays(now, dayCounter * 2 + 3),
          status: 'Excused',
          note: 'College Sports Event leave'
        });
        dayCounter++;
      }
    });

    await Attendance.insertMany(attendanceRecords);

    // 4. Create Weekly Timetable Grid (Monday to Friday)
    const sampleTimetable = [
      // Monday
      { userId, subjectId: dsa._id, day: 'Monday', classroom: 'CS Lab 2', startTime: '09:00', endTime: '10:30', note: 'Bring algorithm notebook' },
      { userId, subjectId: dbms._id, day: 'Monday', classroom: 'Lecture Hall 104', startTime: '11:00', endTime: '12:30', note: 'SQL lab follow-up' },
      { userId, subjectId: os._id, day: 'Monday', classroom: 'Lecture Hall 102', startTime: '14:00', endTime: '15:30', note: 'Kernel architecture discussion' },

      // Tuesday
      { userId, subjectId: cn._id, day: 'Tuesday', classroom: 'Networks Lab', startTime: '09:30', endTime: '11:00', note: 'Cisco packet tracer practice' },
      { userId, subjectId: se._id, day: 'Tuesday', classroom: 'Seminar Hall 3', startTime: '11:30', endTime: '13:00', note: 'Scrum sprint demo' },
      { userId, subjectId: dsa._id, day: 'Tuesday', classroom: 'Lecture Hall 101', startTime: '14:30', endTime: '16:00', note: 'Graph theory problem solving' },

      // Wednesday
      { userId, subjectId: dbms._id, day: 'Wednesday', classroom: 'Database Lab', startTime: '09:00', endTime: '10:30', note: 'Stored procedures & triggers' },
      { userId, subjectId: os._id, day: 'Wednesday', classroom: 'Linux Systems Lab', startTime: '11:00', endTime: '12:30', note: 'POSIX threads programming' },
      { userId, subjectId: cn._id, day: 'Wednesday', classroom: 'Lecture Hall 205', startTime: '14:00', endTime: '15:30', note: 'Subnetting tutorial' },

      // Thursday
      { userId, subjectId: se._id, day: 'Thursday', classroom: 'Seminar Hall 3', startTime: '10:00', endTime: '11:30', note: 'Code review session' },
      { userId, subjectId: dsa._id, day: 'Thursday', classroom: 'Lecture Hall 101', startTime: '12:00', endTime: '13:30', note: 'Greedy algorithms lecture' },
      { userId, subjectId: dbms._id, day: 'Thursday', classroom: 'Lecture Hall 104', startTime: '15:00', endTime: '16:30', note: 'Transaction ACID isolation levels' },

      // Friday
      { userId, subjectId: os._id, day: 'Friday', classroom: 'Linux Systems Lab', startTime: '09:00', endTime: '10:30', note: 'Deadlock detection algorithms' },
      { userId, subjectId: cn._id, day: 'Friday', classroom: 'Networks Lab', startTime: '11:00', endTime: '12:30', note: 'HTTP/2 vs HTTP/3 deep dive' },
      { userId, subjectId: se._id, day: 'Friday', classroom: 'Hall 301', startTime: '14:00', endTime: '15:30', note: 'Weekly milestone wrap-up' }
    ];

    await Timetable.insertMany(sampleTimetable);

    // 5. Create Examinations (Upcoming & Completed)
    const sampleExams = [
      {
        userId,
        subjectId: dsa._id,
        examDate: addDays(now, 4),
        startTime: '10:00',
        endTime: '13:00',
        venue: 'Main Academic Auditorium - Block A',
        examType: 'Midterm',
        syllabus: 'Modules 1 to 3: Sorting, Heaps, Graph BFS/DFS, Disjoint Sets, and Greedy Methods.',
        maxMarks: 100,
        isCompleted: false,
        notes: 'Bring non-programmable scientific calculator and student ID card.'
      },
      {
        userId,
        subjectId: dbms._id,
        examDate: addDays(now, 8),
        startTime: '14:00',
        endTime: '17:00',
        venue: 'Examination Complex - Hall 2',
        examType: 'Midterm',
        syllabus: 'ER Modeling, Relational Calculus, SQL DDL/DML, Functional Dependencies, and Normal Forms.',
        maxMarks: 100,
        isCompleted: false,
        notes: 'Focus on 3NF vs BCNF proofs and B+ tree splitting.'
      },
      {
        userId,
        subjectId: os._id,
        examDate: addDays(now, 15),
        startTime: '10:00',
        endTime: '13:00',
        venue: 'Main Academic Auditorium - Block B',
        examType: 'Midterm',
        syllabus: 'Processes, Semaphores, Monitors, CPU Scheduling, Virtual Memory, and Page Replacement Algorithms.',
        maxMarks: 100,
        isCompleted: false,
        notes: 'Solve previous 3 years exam papers.'
      },
      {
        userId,
        subjectId: cn._id,
        examDate: subDays(now, 14),
        startTime: '10:00',
        endTime: '11:30',
        venue: 'Classroom 302',
        examType: 'Quiz',
        syllabus: 'OSI Reference Model, Framing, Error Detection (CRC), and Stop-and-Wait ARQ.',
        maxMarks: 25,
        obtainedMarks: 23,
        isCompleted: true,
        notes: 'Scored 92% on CRC polynomials.'
      },
      {
        userId,
        subjectId: se._id,
        examDate: subDays(now, 20),
        startTime: '14:00',
        endTime: '16:00',
        venue: 'Seminar Hall 1',
        examType: 'Unit Test',
        syllabus: 'Agile vs Waterfall, Requirements Engineering, Use-Case Diagrams, and Sequence Diagrams.',
        maxMarks: 50,
        obtainedMarks: 46,
        isCompleted: true,
        notes: 'Great feedback on UML diagrams.'
      }
    ];

    await Exam.insertMany(sampleExams);

    // 6. Create Notes
    const sampleNotes = [
      {
        userId,
        subjectId: dsa._id,
        title: 'Master Theorem for Divide & Conquer Recurrences',
        content: `Master Method Formula: T(n) = a*T(n/b) + f(n)\n\nCase 1: If f(n) = O(n^(log_b(a) - ε)), then T(n) = Θ(n^log_b(a))\nCase 2: If f(n) = Θ(n^(log_b(a)) * log^k(n)), then T(n) = Θ(n^log_b(a) * log^(k+1)(n))\nCase 3: If f(n) = Ω(n^(log_b(a) + ε)) and regularity condition holds, then T(n) = Θ(f(n))\n\nRemember: MergeSort has a=2, b=2, f(n)=O(n) -> Case 2 applies -> O(n log n).`,
        isFavorite: true,
        tags: ['algorithms', 'complexity', 'midterm-prep'],
        color: '#eff6ff'
      },
      {
        userId,
        subjectId: dbms._id,
        title: 'ACID Properties & Serializability Summary',
        content: `Atomicity: All-or-nothing execution managed by Write-Ahead Logging (WAL).\nConsistency: Database transitions from one valid state to another satisfying all integrity constraints.\nIsolation: Concurrent transactions execute without interference (2-Phase Locking, Snapshot Isolation).\nDurability: Committed transactions persist permanently in non-volatile storage (Redo logs).`,
        isFavorite: true,
        tags: ['dbms', 'transactions', 'exam-cheat-sheet'],
        color: '#f5f3ff'
      },
      {
        userId,
        subjectId: os._id,
        title: 'Banker\'s Algorithm for Deadlock Avoidance',
        content: `Data structures: Available[m], Max[n][m], Allocation[n][m], Need[n][m].\n\nKey Rule:\nNeed[i][j] = Max[i][j] - Allocation[i][j]\n\nSafety Algorithm:\n1. Let Work = Available and Finish[i] = false for all i.\n2. Find an index i such that Finish[i] == false and Need[i] <= Work.\n3. If found: Work = Work + Allocation[i], Finish[i] = true, go to step 2.\n4. If all Finish[i] == true, system is in a SAFE state.`,
        isFavorite: false,
        tags: ['operating-systems', 'deadlock', 'algorithms'],
        color: '#ecfdf5'
      },
      {
        userId,
        subjectId: cn._id,
        title: 'IPv4 vs IPv6 Header Comparison & Subnetting Cheat Sheet',
        content: `IPv4 Header:\n- 20-60 bytes (Variable length due to options)\n- Fields: Version, IHL, TOS, Total Length, ID, Flags, Fragment Offset, TTL, Protocol, Checksum, Source & Dest IP.\n\nIPv6 Header:\n- Fixed 40 bytes (Simplifies router hardware processing!)\n- Fields: Version, Traffic Class, Flow Label, Payload Length, Next Header, Hop Limit, 128-bit Source & Dest IP.\n- Checksum eliminated at network layer!`,
        isFavorite: false,
        tags: ['networking', 'ipv4', 'ipv6'],
        color: '#fffbeb'
      }
    ];

    await Note.insertMany(sampleNotes);
    return true;
  } catch (error) {
    console.error('[Populate Error]:', error);
    throw error;
  }
};

// @desc    Populate sample academic data for the logged-in student
// @route   POST /api/seed
// @access  Private
export const seedSampleData = async (req, res) => {
  try {
    const userId = req.user._id;
    await populateStudentData(userId);

    return res.status(200).json({
      success: true,
      message: 'Sample academic dataset loaded successfully! 5 subjects, 7 assignments, 75+ attendance records, weekly timetable, 5 exams, and 4 notes are now active.'
    });
  } catch (error) {
    console.error('[Seed Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error generating sample data'
    });
  }
};

// Auto-seed demo student account if not present on server start
export const ensureDemoStudentExists = async () => {
  try {
    const demoEmail = 'alex.rivera@college.edu';
    const user = await User.findOne({ email: demoEmail });
    if (!user) {
      console.log('[Auto-Seed] Initializing demo student (Alex Rivera)...');
      const newUser = await User.create({
        name: 'Alex Rivera',
        email: demoEmail,
        password: 'Password123!',
        college: 'Stanford University',
        semester: 'Semester 5',
        department: 'Computer Science & Engineering',
        targetAttendance: 75
      });
      await populateStudentData(newUser._id);
      console.log('[Auto-Seed] Demo student and academic data created successfully!');
    } else {
      console.log('[Auto-Seed] Demo student verified in database.');
    }
  } catch (err) {
    console.error('[Auto-Seed Error]:', err.message);
  }
};

// @desc    Clear all academic data for logged-in student (Reset to blank state)
// @route   DELETE /api/seed/reset
// @access  Private
export const resetStudentData = async (req, res) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      Subject.deleteMany({ userId }),
      Assignment.deleteMany({ userId }),
      Attendance.deleteMany({ userId }),
      Timetable.deleteMany({ userId }),
      Exam.deleteMany({ userId }),
      Note.deleteMany({ userId })
    ]);

    return res.status(200).json({
      success: true,
      message: 'All your academic data has been safely cleared. You have a fresh, blank canvas.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error clearing academic data'
    });
  }
};
