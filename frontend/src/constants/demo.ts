export const DEMO_ACCOUNTS = {
  STUDENT: {
    role: 'student',
    student_code: 'STU-1001',
    pin: '1001',
    display_name: 'Kofi Mensah',
    label: 'Student (Kofi Mensah)',
    school: 'Accra Academy Demo',
  },
  TEACHER: {
    role: 'teacher',
    email: 'teacher@school.edu',
    display_name: 'Mrs. Abena Mensah',
    label: 'Teacher (Mrs. Abena Mensah)',
    class: 'Basic 8 Mathematics',
  },
  PARENT: {
    role: 'parent',
    email: 'parent@family.edu',
    display_name: 'Mrs. Efua Appiah',
    label: 'Parent (Mrs. Efua Appiah)',
    child: 'Kofi Mensah',
    link_code: 'WW-8492',
  },
  ADMIN: {
    role: 'admin',
    email: 'admin@school.edu',
    display_name: 'Mr. Kwame Boateng',
    label: 'Admin (Mr. Kwame Boateng)',
  },
} as const;

export const DEMO_LABELS = {
  DEMO_MODE_BADGE: 'Demonstration Mode (Seed Data)',
  MOCK_AI_BADGE: 'Mock Engine / Verified Rules',
  SIMULATED_RETEST: 'Simulated Re-test',
  DEMO_DISCLAIMER: 'All data shown is synthetic demonstration data for NYLP AI Hackathon evaluation.',
} as const;
