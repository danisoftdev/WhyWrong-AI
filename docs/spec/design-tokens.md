# WhyWrong AI: Design Tokens Specification

Sampled directly from reference mockup images (`docs/design/01_full_mockup.jpg` - `05_...`).

## 1. Color Palette

### Surfaces & Backgrounds
- `--bg-midnight`: `#0B1020` — Landing page background (edges sample `#070D1D`)
- `--bg-teacher`: `#0C1421` — Teacher command center background
- `--card-teacher`: `#111E38` — Teacher card and container background
- `--surface-student`: `#F7F9FC` — Student studio light background
- `--surface-student-card`: `#FFFFFF` — Student cards
- `--surface-student-sidebar`: `#F3F5FD` — Student sidebar and light secondary panels

### Brand & Accents
- `--primary`: `#734DFD` — Primary buttons, active states, key links
- `--primary-hover`: `#5F37F3` — Hover state for primary actions
- `--primary-soft`: `#775DFC` — Stepper indicators, progress bars, highlights
- `--accent-cyan`: `#22D3EE` — Glowing ring, agent timeline nodes, graph highlights
- `--gradient-cta`: `linear-gradient(135deg, #734DFD 0%, #3B82F6 100%)`

### Semantic Feedback
- `--success`: `#0BAA7B` — Correct answers, resolved misconceptions, strong mastery
- `--warning`: `#F48B2C` — In-progress items, moderate evidence, okay mastery
- `--danger`: `#E5484D` — Incorrect answer banner, weak mastery, detected misconception badges

### Subject Pastel Cards (Student Dashboard 3x3 Grid)
1. **Mathematics**: `#D9C2FC` (Lavender)
2. **Physics**: `#D4FBE9` (Light Mint Blue)
3. **Computing**: `#FDDFE6` (Soft Rose)
4. **Chemistry**: `#E3F7E0` (Pale Green)
5. **Biology**: `#FEEACC` (Soft Amber)
6. **English**: `#E2F1FE` (Sky Blue)
7. **Geography**: `#FEF5D7` (Cream Yellow)
8. **Economics**: `#ECE0FC` (Lilac)
9. **Health Science**: `#FFEBE5` (Peach)

## 2. Typography
- **Display**: Space Grotesk (headings, titles, stats)
- **Body**: Inter (copy, options, explanations, UI text)
- **Code & Math**: JetBrains Mono (formulae, code blocks, technical indicators)

## 3. Shapes & Shadows
- **Card Radii**: `16px` to `24px` (`rounded-2xl` to `rounded-3xl`)
- **Button Radii**: `12px` to `9999px` (pills and soft buttons)
- **Student Shadow**: `0 10px 30px -5px rgba(115, 77, 253, 0.08)`
- **Dark Glow**: `0 0 40px -10px rgba(115, 77, 253, 0.35)`
- **Touch Target**: Minimum `44px` height on all interactive elements.
