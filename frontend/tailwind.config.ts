import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Backgrounds ─────────────────────────────────────────
        midnight:       '#0B1020',   // Landing page background
        teacher:        '#0C1421',   // Teacher command center background
        'teacher-card': '#111E38',   // Teacher dashboard cards
        'surface':      '#F7F9FC',   // Student studio background
        'surface-sidebar': '#F3F5FD', // Student sidebar / panel

        // ── Brand ───────────────────────────────────────────────
        primary:        '#734DFD',
        'primary-soft': '#775DFC',
        cyan:           '#22D3EE',

        // ── Semantic ────────────────────────────────────────────
        success:  '#0BAA7B',
        warning:  '#F48B2C',
        danger:   '#E5484D',

        // ── Subject pastels ─────────────────────────────────────
        'subject-mathematics':    '#D9C2FC',
        'subject-physics':        '#E2F1FE',
        'subject-computing':      '#D4FBE9',
        'subject-chemistry':      '#FDDFE6',
        'subject-biology':        '#E3F7E0',
        'subject-english':        '#FEEACC',
        'subject-geography':      '#E2F1FE',
        'subject-economics':      '#FEF5D7',
        'subject-health-science': '#ECE0FC',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card:   '16px',
        'card-lg': '24px',
        btn:    '10px',
        input:  '8px',
      },
      boxShadow: {
        'card-light': '0 2px 12px rgba(0,0,0,0.08)',
        'card-dark':  '0 0 0 1px rgba(255,255,255,0.08)',
        'glow-cyan':  '0 0 40px rgba(34,211,238,0.25)',
        'glow-primary': '0 0 30px rgba(115,77,253,0.35)',
      },
      backgroundImage: {
        'gradient-cta': 'linear-gradient(135deg, #734DFD 0%, #3B82F6 100%)',
        'gradient-heading': 'linear-gradient(135deg, #734DFD 0%, #22D3EE 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config
