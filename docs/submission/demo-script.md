# WhyWrong AI: 3-Minute Hackathon Demo Script

**Theme**: "Fix the thinking, not just the answer."  
**Time Limit**: 3 Minutes (180 Seconds)  
**Presenter**: Daniel Awuah Appiah | NYLP AI Hackathon 2026

---

## ⏱️ Timeline & Screen Flow

### Part 1: The Problem & The Mission (0:00 – 0:35)
* **Screen**: Landing Page (`Screen 1: Visitor`)
* **Visual**: Show the cinematic dark landing page (`#0B1020`), glowing ring, and floating diagnostic cards (`1/3 + 1/4 = 2/7` with red cross).
* **Script**:
  > *"When a student answers 1/3 + 1/4 = 2/7, conventional quiz software marks it wrong, subtracts a mark, and displays the correct answer '7/12'. But that doesn't fix anything! The student was following a coherent mental rule: 'add tops, add bottoms'.
  >
  > WhyWrong AI is an autonomous educational diagnosis and remediation platform that finds the wrong idea behind the wrong answer. Our mission: **Fix the thinking, not just the answer**."*

---

### Part 2: The Student Diagnostic Loop (0:35 – 1:25)
* **Screen**: Student Studio → Quiz Flow (`Screens 2, 3, 4, 5, 6, 7: Student (Kofi)`)
* **Visual**:
  1. Click **Student (Kofi)** on the DemoBar. Show the 3x3 pastel subject grid.
  2. Click **Continue Fraction Quiz**.
  3. Show the question $\frac{1}{3} + \frac{1}{4} = ?$ with the chosen option $\frac{2}{7}$ marked with a red cross.
  4. Show **Diagnosis**: Banner *"Incorrect Answer. But that's okay! Let's find out why."* with the **Evidence Strength Meter** (Moderate — never an overconfident percentage!).
  5. Show **Evidence Quote**: Literal substring `"1/3 + 1/4 = 2/7"` with breakdown $1+1=2$ and $3+4=7$.
  6. Click **Continue to Probe Questions**: Show probe question $\frac{1}{5} + \frac{1}{10}$. Select $\frac{2}{15}$ to confirm the mental rule.
  7. Show **Remediation Lab**:
     - The Pizza Counterexample: $\frac{1}{2} + \frac{1}{2} \neq \frac{2}{4}$.
     - Interactive Fraction Strip Simulation with the animated Play button.
     - 7-day retention re-test scheduled.
* **Script**:
  > *"Watch our six-stage misconception loop in action. Kofi answers 2/7. WhyWrong doesn't jump to conclusions—it flags a tentative hypothesis with moderate evidence strength.
  >
  > Next, the engine serves a discriminating probe question: 1/5 + 1/10. Because Kofi selects 2/15, it confirms the rule.
  >
  > Now the magic happens: WhyWrong provides a conceptual breakthrough—the pizza slice counterexample and interactive fraction strip simulator showing why unequal slices must be converted to common denominators before adding. Finally, it schedules a retention re-test in 7 days."*

---

### Part 3: Teacher Command Center & Audit (1:25 – 2:05)
* **Screen**: Teacher Command Center (`Screen 8: Teacher (Ms. Mensah)`)
* **Visual**:
  1. Switch to **Teacher (Ms. Mensah)** on DemoBar. Show dark command center (`#0C1421`).
  2. Show 4 KPI tiles: 24 students, active misconceptions, 74% concept mastery.
  3. Show **Common Misconceptions (Ranked)** with percentage bars.
  4. Show **Concept Mastery Heatmap** with Strong, Okay, Weak status.
  5. Click **Student Drill-Down**: Show teacher audit review (`Accept` / `Reject`).
  6. Click **Generate Parent Link Code**: Generates `WW-8492`.
* **Script**:
  > *"Now let's switch to the Teacher Command Center. Teachers don't just see test scores; they see the Class Misconception Map. 33% of Class 2A struggles with 'add tops, add bottoms'.
  >
  > Teachers have full oversight: they can accept, edit, or reject the AI's diagnosis, generate a 5-minute targeted blackboard intervention, and issue secure one-time parent link codes."*

---

### Part 4: Parent Portal & Plain-Language Digest (2:05 – 2:35)
* **Screen**: Parent Portal (`Screens 14, 15, 16: Parent (Mr. Appiah)`)
* **Visual**:
  1. Switch to **Parent (Mr. Appiah)**. Show light student theme.
  2. Show **This Week** plain-language card: *"Kofi is working on one idea about fractions."*
  3. Show **How to Help at Home** tip card: 5-minute paper fraction strip folding activity.
  4. Show **Weekly Digest**: One-page printable summary with zero rankings or peer comparison.
* **Script**:
  > *"For parents, WhyWrong translates technical pedagogical diagnosis into supportive, plain language. No stressful class ranks or mark penalties.
  >
  > Mr. Appiah sees exactly what Kofi is working on and receives a 5-minute home activity: folding paper strips to build spatial understanding together."*

---

### Part 5: Architecture & Hackathon Wrap-Up (2:35 – 3:00)
* **Screen**: Knowledge Graph & AI Provider Health (`Screens 12 & 13 / Admin`)
* **Visual**: Show the React Flow Concept Knowledge Graph and live Agent Timeline.
* **Script**:
  > *"Under the hood:
  > - **WhyWrong Engine**: Our proprietary rules engine achieves **100% diagnostic accuracy** with **0.3 ms latency** on our benchmark.
  > - **100% Free Tier**: Powered by our deterministic engine, Google Gemini Flash, and Groq—zero paid APIs, zero Claude/Anthropic dependencies.
  > - **cPanel Ready**: Built with React, PHP 8.2 REST, and PDO MySQL for low-cost shared hosting deployment.
  >
  > WhyWrong AI: Transforming wrong answers into conceptual breakthroughs."*
