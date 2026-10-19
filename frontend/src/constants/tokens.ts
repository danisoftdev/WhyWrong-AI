export const COLOR_TOKENS = {
  BG_LANDING: 'var(--color-bg-landing, #0B1020)',
  BG_STUDENT: 'var(--color-bg-student, #F7F9FC)',
  BG_STUDENT_SIDEBAR: 'var(--color-bg-student-sidebar, #F3F5FD)',
  BG_TEACHER: 'var(--color-bg-teacher, #0C1421)',
  BG_TEACHER_CARD: 'var(--color-bg-teacher-card, #111E38)',
  PRIMARY: 'var(--color-primary, #734DFD)',
  PRIMARY_GRADIENT: 'var(--color-primary-gradient, linear-gradient(135deg, #734DFD 0%, #2563EB 100%))',
  ACCENT_CYAN: 'var(--color-accent-cyan, #22D3EE)',
  SUCCESS: 'var(--color-success, #0BAA7B)',
  WARNING: 'var(--color-warning, #F48B2C)',
  DANGER: 'var(--color-danger, #E5484D)',
} as const;

export const BREAKPOINTS = {
  MOBILE_MIN: 360,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_ROLE: 'whywrong_active_role',
  AUTH_USER: 'whywrong_user_data',
  THEME_MODE: 'whywrong_theme',
} as const;
