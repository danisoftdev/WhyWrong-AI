export const ROLES = {
  VISITOR: 'visitor',
  STUDENT: 'student',
  TEACHER: 'teacher',
  PARENT: 'parent',
  ADMIN: 'admin',
} as const;

export type AppRole = typeof ROLES[keyof typeof ROLES];

export const ROLE_LABELS: Record<AppRole, string> = {
  visitor: 'Guest Visitor',
  student: 'Student Studio',
  teacher: 'Teacher Command Center',
  parent: 'Parent Window',
  admin: 'Administrator',
};
