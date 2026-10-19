# Design System Rules — WhyWrong AI

## Reference Images
Always open the reference images before building any screen:
- docs/design/01_full_mockup.jpg          — full overview
- docs/design/02_landing_and_student_dashboard.jpg
- docs/design/03_quiz_diagnosis_probe.jpg
- docs/design/04_remediation_practice_teacher.jpg
- docs/design/05_progress_report_mobile_graph_agent.jpg

After building a screen, take a screenshot and compare side-by-side. List differences and fix them.

## Design Tokens (from tailwind.config.ts and tokens.css)

### Backgrounds
| Token              | Hex     | Usage                                      |
|--------------------|---------|--------------------------------------------|
| bg-midnight        | #0B1020 | Landing page background                    |
| bg-teacher         | #0C1421 | Teacher command center background          |
| bg-teacher-card    | #111E38 | Teacher dashboard cards                    |
| surface-student    | #F7F9FC | Student studio background                  |
| surface-sidebar    | #F3F5FD | Student sidebar / panel background         |

### Brand
| Token         | Hex     | Usage                                   |
|---------------|---------|-----------------------------------------|
| primary       | #734DFD | Primary buttons, selected states, links |
| primary-soft  | #775DFC | Step indicators, progress bars          |
| accent-cyan   | #22D3EE | Glow ring, agent timeline, graph nodes  |

### Semantic
| Token   | Hex     | Usage                                              |
|---------|---------|----------------------------------------------------|
| success | #0BAA7B | Strong mastery, correct answers, resolved items    |
| warning | #F48B2C | In-progress, moderate mastery                      |
| danger  | #E5484D | Incorrect answers, misconception nodes, weak       |

### Subject Pastels
| Subject        | Hex     |
|----------------|---------|
| Mathematics    | #D9C2FC |
| Physics        | #E2F1FE |
| Computing      | #D4FBE9 |
| Chemistry      | #FDDFE6 |
| Biology        | #E3F7E0 |
| English        | #FEEACC |
| Geography      | #E2F1FE |
| Economics      | #FEF5D7 |
| Health Science | #ECE0FC |

## Typography
- **Display**: Space Grotesk (self-hosted in public/fonts/)
- **Body**: Inter (self-hosted)
- **Code/Math**: JetBrains Mono (self-hosted)
- DO NOT load fonts from Google Fonts CDN at runtime.

## Shape & Radius
- Cards: border-radius 16–24px
- Buttons: border-radius 8–12px
- Inputs: border-radius 8px

## Shadows
- Light screens: soft box-shadow (0 2px 12px rgba(0,0,0,0.08))
- Dark screens: subtle glow with thin 1px border (rgba(255,255,255,0.08))

## Icons
- Use Lucide React exclusively.
- Mascot: friendly robot SVG used in quiz, diagnosis and probe screens.

## Maths
- Render fractions as stacked numerator/denominator using KaTeX or MathML.
- NEVER render 1/3 + 1/4 as plain text slash notation in quiz cards.

## Motion
- Use Framer Motion for fades and transitions.
- Always check prefers-reduced-motion and skip animations if set.
- Glow ring on landing page uses CSS animation.

## Accessibility
- WCAG 2.1 AA contrast minimum.
- Visible keyboard focus ring on every interactive element.
- Semantic headings (h1 > h2 > h3 in order, never skip).
- All inputs have visible labels (not just placeholders).
- Minimum 44×44px touch targets.
- All images have meaningful alt text.
- All graphs have text alternatives (aria-label or figcaption).

## Component Checklist
Before marking a component done:
- [ ] Matches reference image colours and layout
- [ ] Works at 360px width (no overflow)
- [ ] Works at 768px and 1440px
- [ ] Keyboard accessible
- [ ] Reduced-motion safe
- [ ] Uses design tokens, not hardcoded colours

## Screens Reference
| # | Screen                  | Theme   | Reference image |
|---|-------------------------|---------|-----------------|
| 1 | Landing page            | Dark    | 02_             |
| 2 | Student dashboard       | Light   | 02_             |
| 3 | Answer question         | Light   | 03_             |
| 4 | Diagnosis               | Light   | 03_             |
| 5 | Probe questions         | Light   | 03_             |
| 6 | Learning path           | Light   | 04_             |
| 7 | Practice / Lab          | Light   | 04_             |
| 8 | Teacher command center  | Dark    | 04_             |
| 9 | Student progress        | Light   | 05_             |
| 10| PDF report preview      | Light   | 05_             |
| 11| Mobile view             | Light   | 05_             |
| 12| Concept graph           | Dark    | 05_             |
| 13| AI agent activity       | Dark    | 05_             |
| 14| Parent home             | Light   | (new)           |
| 15| Link a child            | Light   | (new)           |
| 16| Weekly digest & print   | Light   | (new)           |
