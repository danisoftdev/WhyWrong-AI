export interface SubjectQuizConfig {
  slug: string;
  badge: string;
  topic: string;
  stepDescription: string;
  question: {
    prompt: string;
    promptMath?: string;
    isCode?: boolean;
    options: Array<{ id: string; text: string; label: string; note?: string }>;
    defaultOptionId: string;
    defaultWorking: string;
  };
  diagnosis: {
    evidenceQuote: string;
    misconception: {
      id: string;
      label: string;
      explanation: string;
      whyFeelsTrue: string;
    };
  };
  probe: {
    prompt: string;
    options: Array<{ id: string; text: string; label: string; note?: string }>;
    defaultProbeId: string;
  };
  remediation: {
    counterexampleTitle: string;
    counterexampleText: string;
    workedContrastIncorrect: {
      rule: string;
      example: string;
      desc: string;
    };
    workedContrastCorrect: {
      rule: string;
      example: string;
      desc: string;
    };
    simulation: {
      title: string;
      description: string;
      type: 'fraction' | 'physics' | 'computing' | 'chemistry' | 'biology' | 'english' | 'geography' | 'economics' | 'health';
    };
    practice: Array<{
      prompt: string;
      options: string[];
      correct: string;
    }>;
  };
}

export const SUBJECT_QUIZ_CONFIGS: Record<string, SubjectQuizConfig> = {
  mathematics: {
    slug: 'mathematics',
    badge: 'Mathematics • Fractions & Ratios',
    topic: 'Fractions: Addition with Unequal Denominators',
    stepDescription: 'Fraction Addition',
    question: {
      prompt: 'What is the sum of these fractions?',
      promptMath: '\\frac{1}{3} + \\frac{1}{4}',
      options: [
        { id: 'opt-a', text: '\\frac{7}{12}', label: 'A', note: 'Correct sum' },
        { id: 'opt-b', text: '\\frac{2}{7}', label: 'B', note: 'Diagnostic distractor' },
        { id: 'opt-c', text: '\\frac{2}{12}', label: 'C' },
        { id: 'opt-d', text: '\\frac{5}{12}', label: 'D' },
      ],
      defaultOptionId: 'opt-b',
      defaultWorking: '1/3 + 1/4 = (1+1)/(3+4) = 2/7',
    },
    diagnosis: {
      evidenceQuote: '1/3 + 1/4 = 2/7',
      misconception: {
        id: 'MATH-FRAC-001',
        label: 'Add tops, add bottoms',
        explanation: 'Adding numerators together and denominators together directly as independent integers.',
        whyFeelsTrue: 'It works for whole numbers (1+1=2, 3+4=7), so the mind treats fractions like two separate numbers.',
      },
    },
    probe: {
      prompt: 'Is \\frac{1}{2} + \\frac{1}{2} equal to \\frac{2}{4}?',
      options: [
        { id: 'p-opt-a', text: '\\frac{2}{15}', label: 'A', note: 'Predicted wrong rule' },
        { id: 'p-opt-b', text: '\\frac{3}{10}', label: 'B', note: 'Correct sum' },
        { id: 'p-opt-c', text: '\\frac{2}{10}', label: 'C', note: 'Slip' },
        { id: 'p-opt-d', text: "I'm not sure", label: 'D', note: 'Unsure' },
      ],
      defaultProbeId: 'p-opt-a',
    },
    remediation: {
      counterexampleTitle: "The Counterexample: Why you can't just add across",
      counterexampleText: "If you eat 1/2 of a pizza and then eat another 1/2 of a pizza, you ate 1 whole pizza (2/2)! You did NOT eat 2/4 (which would only be half a pizza).",
      workedContrastIncorrect: {
        rule: 'Mistaken Rule (Add Tops & Bottoms)',
        example: '1/3 + 1/4 = 2/7',
        desc: 'Treats numerators and denominators as independent whole numbers. But fractions are proportional parts of a whole.',
      },
      workedContrastCorrect: {
        rule: 'Correct Rule (Common Denominators)',
        example: '1/3 + 1/4 = 4/12 + 3/12 = 7/12',
        desc: 'Divide into equal-sized twelfths first. Once pieces are the same size, add the tops: 4 + 3 = 7.',
      },
      simulation: {
        title: 'Fraction Strip Visualizer',
        description: 'Watch what happens when 1/3 and 1/4 are divided into equal 12th slices.',
        type: 'fraction',
      },
      practice: [
        { prompt: '1/4 + 1/2 = ?', options: ['2/6', '3/4', '2/4'], correct: '3/4' },
        { prompt: '2/5 + 1/10 = ?', options: ['3/15', '5/10 (1/2)', '2/15'], correct: '5/10 (1/2)' },
        { prompt: '1/3 + 1/6 = ?', options: ['2/9', '3/6 (1/2)', '2/6'], correct: '3/6 (1/2)' },
      ],
    },
  },

  physics: {
    slug: 'physics',
    badge: 'Physics • Motion & Forces',
    topic: 'Kinematics: Gravitational Acceleration & Free Fall',
    stepDescription: 'Free Fall Velocity',
    question: {
      prompt: 'Ignoring air resistance, a 5 kg bowling ball and a 1 kg wooden sphere are dropped simultaneously from a 50m tower. Which lands first?',
      options: [
        { id: 'opt-a', text: 'The 5 kg bowling ball lands first', label: 'A', note: 'Diagnostic distractor' },
        { id: 'opt-b', text: 'Both land at the exact same instant', label: 'B', note: 'Correct' },
        { id: 'opt-c', text: 'The 1 kg ball lands first due to lower inertia', label: 'C' },
        { id: 'opt-d', text: 'It depends on their atmospheric drag coefficient', label: 'D' },
      ],
      defaultOptionId: 'opt-a',
      defaultWorking: '5kg has more weight and gravity pulling it down so it must accelerate faster.',
    },
    diagnosis: {
      evidenceQuote: '5 kg bowling ball lands first',
      misconception: {
        id: 'PHY-MOT-001',
        label: 'Heavier objects fall faster',
        explanation: 'Believing gravitational acceleration depends on object mass, confusing everyday air resistance with gravity.',
        whyFeelsTrue: 'Everyday intuition: a stone drops faster than a feather in normal air because of air resistance.',
      },
    },
    probe: {
      prompt: 'If a 10 kg iron sphere and a 0.1 kg feather are dropped inside an evacuated vacuum tube (zero air), what happens?',
      options: [
        { id: 'p-opt-a', text: 'The 10 kg iron sphere lands first', label: 'A', note: 'Predicted wrong rule' },
        { id: 'p-opt-b', text: 'They land at the exact same time', label: 'B', note: 'Correct' },
        { id: 'p-opt-c', text: 'The feather remains suspended', label: 'C' },
        { id: 'p-opt-d', text: "I'm not sure", label: 'D' },
      ],
      defaultProbeId: 'p-opt-a',
    },
    remediation: {
      counterexampleTitle: "Galileo's Equivalence: Mass Cancels Acceleration",
      counterexampleText: "Newton's Second Law: a = F / m. The gravitational force on the 5kg ball is 5x greater, but its inertia (resistance to motion) is also 5x greater! The 5 cancels out: a = (5*g) / 5 = g = 9.8 m/s².",
      workedContrastIncorrect: {
        rule: 'Mistaken Rule (Heavier = Faster)',
        example: 'v = m * g * t (False)',
        desc: 'Assumes gravity imparts speed proportional to mass without considering inertial resistance.',
      },
      workedContrastCorrect: {
        rule: 'Correct Rule (Universal Free-Fall)',
        example: 'a = g = 9.8 m/s² (Constant for all masses)',
        desc: 'All objects in a vacuum accelerate at precisely the same rate regardless of weight or size.',
      },
      simulation: {
        title: 'Vacuum Drop Tower Chamber',
        description: 'Compare fall trajectories in standard atmospheric air versus a pure vacuum chamber.',
        type: 'physics',
      },
      practice: [
        { prompt: 'A 2kg brick and a 10kg anvil fall in a vacuum for 3 seconds. What are their speeds?', options: ['Anvil is 5x faster', 'Both are 29.4 m/s', 'Brick is 2x slower'], correct: 'Both are 29.4 m/s' },
        { prompt: 'What provides the downward acceleration in free fall?', options: ['Object weight alone', 'Earth gravitational field g', 'Air pressure'], correct: 'Earth gravitational field g' },
        { prompt: 'Why does a parachute slow a skydiver?', options: ['It decreases their mass', 'It increases air drag force opposing gravity', 'It weakens gravity'], correct: 'It increases air drag force opposing gravity' },
      ],
    },
  },

  computing: {
    slug: 'computing',
    badge: 'Computing • Variables & Execution',
    topic: 'Variables, Assignment & State Mutation',
    stepDescription: 'Imperative Variable State',
    question: {
      prompt: 'What value is printed by this Python code snippet?\n\nx = 10\ny = x + 5\nx = 20\nprint(y)',
      isCode: true,
      options: [
        { id: 'opt-a', text: '25', label: 'A', note: 'Diagnostic distractor (formula link)' },
        { id: 'opt-b', text: '15', label: 'B', note: 'Correct (state snapshot)' },
        { id: 'opt-c', text: '20', label: 'C' },
        { id: 'opt-d', text: 'SyntaxError: variable reassigned', label: 'D' },
      ],
      defaultOptionId: 'opt-a',
      defaultWorking: 'x was updated to 20, and y = x + 5, so 20 + 5 = 25.',
    },
    diagnosis: {
      evidenceQuote: 'y = x + 5 so 20 + 5 = 25',
      misconception: {
        id: 'COMP-VAR-001',
        label: 'Variable stores a permanent formula',
        explanation: 'Treating imperative assignment statements like dynamic spreadsheet formulas that recalculate automatically.',
        whyFeelsTrue: 'Spreadsheet formulas like =A1+5 update automatically when A1 changes, making students expect code to behave like Excel.',
      },
    },
    probe: {
      prompt: 'Consider: a = 2; b = a; a = 5. What value does b hold in memory?',
      options: [
        { id: 'p-opt-a', text: '5 (b updates because a changed to 5)', label: 'A', note: 'Predicted wrong rule' },
        { id: 'p-opt-b', text: '2 (b copied the value 2 at that exact moment)', label: 'B', note: 'Correct' },
        { id: 'p-opt-c', text: '7 (a + b)', label: 'C' },
        { id: 'p-opt-d', text: "I'm not sure", label: 'D' },
      ],
      defaultProbeId: 'p-opt-a',
    },
    remediation: {
      counterexampleTitle: 'The Memory Box Analogy',
      counterexampleText: "In programming, a variable is not an electrical wire or an Excel cell; it is an opaque box in RAM. Assignment copies the evaluated value into the box once and immediately forgets how the value was calculated.",
      workedContrastIncorrect: {
        rule: 'Mistaken Rule (Formula Binding)',
        example: 'y <-> (x + 5) [Dynamic link]',
        desc: 'Assumes variables remember relationships and continuously recalculate when dependencies change.',
      },
      workedContrastCorrect: {
        rule: 'Correct Rule (One-Time Value Copy)',
        example: 'y = 15 [Evaluated value stored in RAM]',
        desc: 'Right-hand side expression is evaluated immediately to a single scalar and stored into the variable slot.',
      },
      simulation: {
        title: 'RAM Memory Slot Inspector',
        description: 'Step line-by-line through bytecode execution to inspect CPU registers and RAM address slots.',
        type: 'computing',
      },
      practice: [
        { prompt: 'p = 4; q = 2; p = p + q; q = 10. What is p?', options: ['14', '6', '12'], correct: '6' },
        { prompt: 'What does the single = operator do in Python/PHP?', options: ['Checks if two expressions are equal', 'Evaluates right side and stores into left side memory', 'Declares a mathematical identity'], correct: 'Evaluates right side and stores into left side memory' },
        { prompt: 'items = [1, 2]; copy = items; items.append(3). Does copy change?', options: ['Yes (both references point to same list in heap)', 'No (lists are always copied)', 'Only in Python 2'], correct: 'Yes (both references point to same list in heap)' },
      ],
    },
  },

  chemistry: {
    slug: 'chemistry',
    badge: 'Chemistry • Atomic Structure & Bonding',
    topic: 'Chemical Bonding: Ionic vs Covalent Electron Transfer',
    stepDescription: 'Valence Electron Configurations',
    question: {
      prompt: 'When Sodium (Na, Group 1) reacts with Chlorine (Cl, Group 17) to synthesize table salt (NaCl), how do the valence electrons behave?',
      options: [
        { id: 'opt-a', text: 'They share electrons equally in a covalent electron cloud', label: 'A', note: 'Diagnostic distractor' },
        { id: 'opt-b', text: 'Na transfers 1 valence electron to Cl, producing Na⁺ and Cl⁻ ions', label: 'B', note: 'Correct' },
        { id: 'opt-c', text: 'Chlorine donates electrons to Sodium', label: 'C' },
        { id: 'opt-d', text: 'Electrons are destroyed in an exothermic reaction', label: 'D' },
      ],
      defaultOptionId: 'opt-a',
      defaultWorking: 'All chemical bonds are formed by atoms sharing electrons together to fill their shells.',
    },
    diagnosis: {
      evidenceQuote: 'share electrons equally in a covalent',
      misconception: {
        id: 'CHEM-BOND-001',
        label: 'All chemical bonds share electrons equally',
        explanation: 'Failing to differentiate between high electronegativity differences (complete ionic transfer) and covalent sharing.',
        whyFeelsTrue: 'Introductory classes often say "atoms bond to share shells", leading students to over-generalize sharing to all compounds.',
      },
    },
    probe: {
      prompt: 'Why does solid table salt conduct electricity when dissolved in water or melted, but sugar (covalent) does not?',
      options: [
        { id: 'p-opt-a', text: 'Salt molecules share electrons faster when wet', label: 'A', note: 'Predicted wrong rule' },
        { id: 'p-opt-b', text: 'NaCl dissociates into free-floating positive and negative ions that carry electrical current', label: 'B', note: 'Correct' },
        { id: 'p-opt-c', text: 'Water breaks covalent bonds instantly', label: 'C' },
        { id: 'p-opt-d', text: "I'm not sure", label: 'D' },
      ],
      defaultProbeId: 'p-opt-a',
    },
    remediation: {
      counterexampleTitle: 'Electronegativity Difference Dictates Bond Type',
      counterexampleText: "Chlorine is extremely electronegative (3.16), while Sodium is very electropositive (0.93). The difference (ΔEN = 2.23 > 1.7) is so enormous that Chlorine literally tears the electron away from Sodium completely!",
      workedContrastIncorrect: {
        rule: 'Mistaken Rule (Universal Sharing)',
        example: 'Na:Cl (Equal sharing)',
        desc: 'Assumes atoms always share electrons harmoniously without considering electronegativity pull.',
      },
      workedContrastCorrect: {
        rule: 'Correct Rule (Ionic Transfer)',
        example: 'Na⁺ + [:Cl:]⁻ (Complete electron transfer)',
        desc: 'Opposite electrical charges attract in a strong electrostatic crystal lattice.',
      },
      simulation: {
        title: 'Ionic Lattice vs Covalent Molecular Reactor',
        description: 'Inspect electron density clouds and electrostatic crystal lattice formation.',
        type: 'chemistry',
      },
      practice: [
        { prompt: 'What type of bond forms between Carbon (2.55) and Hydrogen (2.20)?', options: ['Ionic transfer', 'Nonpolar Covalent sharing', 'Metallic bond'], correct: 'Nonpolar Covalent sharing' },
        { prompt: 'Which ion is formed when Magnesium (Group 2) bonds with Oxygen?', options: ['Mg⁺', 'Mg²⁺', 'Mg⁻'], correct: 'Mg²⁺' },
        { prompt: 'What holds an ionic crystal together?', options: ['Shared electron orbitals', 'Strong electrostatic attraction between opposite ions', 'Gravitational pull'], correct: 'Strong electrostatic attraction between opposite ions' },
      ],
    },
  },

  biology: {
    slug: 'biology',
    badge: 'Biology • Cellular Energy & Respiration',
    topic: 'Metabolism: Cellular Respiration vs Photosynthesis',
    stepDescription: 'Mitochondrial Respiration',
    question: {
      prompt: 'During bright daytime sunlight, do living green plant cells carry out cellular respiration?',
      options: [
        { id: 'opt-a', text: 'No, plants only do photosynthesis in daylight; animals do respiration', label: 'A', note: 'Diagnostic distractor' },
        { id: 'opt-b', text: 'Yes, plant cells respire continuously day and night to produce ATP', label: 'B', note: 'Correct' },
        { id: 'opt-c', text: 'Only subterranean root cells respire, never leaves', label: 'C' },
        { id: 'opt-d', text: 'Respiration only happens during autumn and winter', label: 'D' },
      ],
      defaultOptionId: 'opt-a',
      defaultWorking: 'Plants inhale CO2 and exhale O2 (photosynthesis). Animals do respiration.',
    },
    diagnosis: {
      evidenceQuote: 'plants only do photosynthesis in daylight; animals do respiration',
      misconception: {
        id: 'BIO-RESP-001',
        label: 'Plants photosynthesize instead of respiring',
        explanation: 'Believing photosynthesis and respiration are mutually exclusive equivalents between plants and animals.',
        whyFeelsTrue: 'School textbooks simplify: "plants make oxygen, animals breathe oxygen", making it seem plants have no need to respire.',
      },
    },
    probe: {
      prompt: 'What happens to a plant cell if it is unable to perform cellular respiration at night?',
      options: [
        { id: 'p-opt-a', text: 'It goes to sleep until the morning sun rises', label: 'A', note: 'Predicted wrong rule' },
        { id: 'p-opt-b', text: 'It dies rapidly from lack of ATP required for vital cellular maintenance', label: 'B', note: 'Correct' },
        { id: 'p-opt-c', text: 'It switches to absorbing moonlight energy', label: 'C' },
        { id: 'p-opt-d', text: "I'm not sure", label: 'D' },
      ],
      defaultProbeId: 'p-opt-a',
    },
    remediation: {
      counterexampleTitle: 'Photosynthesis makes food; Respiration burns food for ATP',
      counterexampleText: "Glucose is like gold in a vault; ATP is spendable cash. Photosynthesis puts gold into the vault. But to power active transport, protein synthesis, and cellular division, plant cells MUST burn glucose in mitochondria 24/7!",
      workedContrastIncorrect: {
        rule: 'Mistaken Rule (Plants = Photosynthesis Only)',
        example: 'Sunlight -> Plant Energy -> Done',
        desc: 'Confuses energy storage (glucose synthesis) with actual cellular work (ATP hydrolysis).',
      },
      workedContrastCorrect: {
        rule: 'Correct Rule (All Eukaryotes Respire Continuously)',
        example: 'C₆H₁₂O₆ + 6O₂ -> 6CO₂ + 6H₂O + 32 ATP',
        desc: 'Both plant and animal cells possess mitochondria to produce ATP around the clock.',
      },
      simulation: {
        title: 'Plant Organelle Metabolism Tracker',
        description: 'Monitor simultaneous chloroplast and mitochondria flux under varied lux illumination.',
        type: 'biology',
      },
      practice: [
        { prompt: 'What organelle carries out cellular respiration in plant cells?', options: ['Chloroplasts', 'Mitochondria', 'Vacuoles'], correct: 'Mitochondria' },
        { prompt: 'Why do plants produce oxygen net-positive over 24 hours?', options: ['They never consume oxygen', 'Photosynthesis produces more O₂ during the day than respiration consumes all day', 'They convert nitrogen to oxygen'], correct: 'Photosynthesis produces more O₂ during the day than respiration consumes all day' },
        { prompt: 'What gas do plant seeds consume during germination before sprouting leaves?', options: ['Carbon dioxide', 'Oxygen', 'Methane'], correct: 'Oxygen' },
      ],
    },
  },

  english: {
    slug: 'english',
    badge: 'English • Grammar & Syntax',
    topic: 'Subject-Verb Agreement with Indefinite Pronouns',
    stepDescription: 'Head Noun vs Prepositional Phrase',
    question: {
      prompt: 'Select the grammatically correct sentence:',
      options: [
        { id: 'opt-a', text: 'Each of the participating students have submitted their project.', label: 'A', note: 'Diagnostic distractor (proximity agreement)' },
        { id: 'opt-b', text: 'Each of the participating students has submitted their project.', label: 'B', note: 'Correct' },
        { id: 'opt-c', text: 'Each of the participating students are submitting their project.', label: 'C' },
        { id: 'opt-d', text: 'Each of the participating students were submitted.', label: 'D' },
      ],
      defaultOptionId: 'opt-a',
      defaultWorking: 'Students is plural, so the plural verb "have" must be used.',
    },
    diagnosis: {
      evidenceQuote: 'Each of the participating students have',
      misconception: {
        id: 'ENG-AGR-001',
        label: 'Agreement with adjacent noun (Proximity Agreement)',
        explanation: 'Matching the verb to the plural noun inside a modifying prepositional phrase rather than the actual singular subject pronoun.',
        whyFeelsTrue: 'The word immediately before the verb is "students", so the ear naturally expects a plural verb.',
      },
    },
    probe: {
      prompt: 'Which verb is correct in: "Neither of the candidate solutions _____ acceptable."',
      options: [
        { id: 'p-opt-a', text: 'are (matching candidate solutions)', label: 'A', note: 'Predicted wrong rule' },
        { id: 'p-opt-b', text: 'is (matching the singular head pronoun Neither)', label: 'B', note: 'Correct' },
        { id: 'p-opt-c', text: 'were', label: 'C' },
        { id: 'p-opt-d', text: "I'm not sure", label: 'D' },
      ],
      defaultProbeId: 'p-opt-a',
    },
    remediation: {
      counterexampleTitle: 'The Finger-Cover Test',
      counterexampleText: "Cover the prepositional modifier with your finger! Cross out 'of the participating students'. What is left? 'Each [has] submitted', NOT 'Each have submitted'. 'Each', 'Neither', and 'Everyone' are grammatically singular.",
      workedContrastIncorrect: {
        rule: 'Mistaken Rule (Proximity Agreement)',
        example: 'students [plural] -> have [plural verb]',
        desc: 'Mistakes the object of the preposition for the subject of the clause.',
      },
      workedContrastCorrect: {
        rule: 'Correct Rule (Head Noun Agreement)',
        example: 'Each [singular] ... has [singular verb]',
        desc: 'The grammatical head governs verb number regardless of intervenors.',
      },
      simulation: {
        title: 'Syntactic Clause Tree Analyzer',
        description: 'Deconstruct sentence trees to isolate true subject-verb constituent linkages.',
        type: 'english',
      },
      practice: [
        { prompt: 'One of my friends _____ visiting today.', options: ['is', 'are', 'were'], correct: 'is' },
        { prompt: 'The bouquet of red roses _____ fresh.', options: ['smell', 'smells', 'are smelling'], correct: 'smells' },
        { prompt: 'Everybody in both classes _____ invited.', options: ['is', 'are', 'were'], correct: 'is' },
      ],
    },
  },

  geography: {
    slug: 'geography',
    badge: 'Geography • Earth Systems & Climate',
    topic: 'Earth-Sun Geometry: Astronomical Cause of Seasons',
    stepDescription: 'Axial Tilt & Solar Insolation',
    question: {
      prompt: 'What is the primary scientific reason for the change of seasons on Earth throughout the year?',
      options: [
        { id: 'opt-a', text: 'The Earth is closer to the Sun during summer and farther away during winter', label: 'A', note: 'Diagnostic distractor' },
        { id: 'opt-b', text: "The 23.5° tilt of Earth's rotational axis relative to its orbital plane", label: 'B', note: 'Correct' },
        { id: 'opt-c', text: 'Solar flares cycle every six months to heat the atmosphere', label: 'C' },
        { id: 'opt-d', text: 'Ocean currents shift warm water across the equator in summer', label: 'D' },
      ],
      defaultOptionId: 'opt-a',
      defaultWorking: 'When you are closer to a fire you get hotter, so summer is when Earth is closest to the Sun.',
    },
    diagnosis: {
      evidenceQuote: 'Earth is closer to the Sun during summer',
      misconception: {
        id: 'GEO-SEAS-001',
        label: 'Distance theory of seasons',
        explanation: 'Believing seasons are caused by the elliptical distance from the Sun rather than planetary axial tilt.',
        whyFeelsTrue: 'Everyday physical intuition: moving closer to a heat source increases temperature.',
      },
    },
    probe: {
      prompt: 'When it is mid-summer in Ghana and the UK (July), what season is it in Australia and South Africa?',
      options: [
        { id: 'p-opt-a', text: 'Summer (because Earth is closer to the Sun)', label: 'A', note: 'Predicted wrong rule' },
        { id: 'p-opt-b', text: 'Winter (because the Southern Hemisphere is tilted away from the Sun)', label: 'B', note: 'Correct' },
        { id: 'p-opt-c', text: 'Spring', label: 'C' },
        { id: 'p-opt-d', text: "I'm not sure", label: 'D' },
      ],
      defaultProbeId: 'p-opt-a',
    },
    remediation: {
      counterexampleTitle: 'The January Perihelion Contradiction',
      counterexampleText: "Earth is actually at perihelion (CLOSEST to the Sun: 147 million km) in early JANUARY, right in the freezing depth of Northern Hemisphere winter! Tilt dictates solar angle: direct sunlight concentrates heat over small surface areas.",
      workedContrastIncorrect: {
        rule: 'Mistaken Rule (Proximity to Sun)',
        example: 'Distance = Temperature (False)',
        desc: 'Fails to explain why opposing hemispheres experience opposite seasons simultaneously.',
      },
      workedContrastCorrect: {
        rule: 'Correct Rule (23.5° Axial Tilt)',
        example: 'Tilted Toward = Direct Rays + Longer Days = Summer',
        desc: 'The angle of insolation determines concentrated energy flux per square meter.',
      },
      simulation: {
        title: 'Earth Orbital Tilt & Insolation Simulator',
        description: 'Rotate Earth along its orbital ellipse to visualize solar angle concentration.',
        type: 'geography',
      },
      practice: [
        { prompt: 'What angle is the Earth axis tilted relative to the perpendicular of its orbit?', options: ['23.5°', '45°', '0° (upright)'], correct: '23.5°' },
        { prompt: 'At the Equator, why is temperature warm year-round?', options: ['The Equator is closest to the Sun', 'Direct high-angle sunlight strikes year-round with little seasonal variance', 'Equator has more magma'], correct: 'Direct high-angle sunlight strikes year-round with little seasonal variance' },
        { prompt: 'What date marks the Northern Hemisphere Summer Solstice?', options: ['March 21', 'June 21', 'December 21'], correct: 'June 21' },
      ],
    },
  },

  economics: {
    slug: 'economics',
    badge: 'Economics • Microeconomics & Markets',
    topic: 'Price Elasticity & Curve Shifts vs Movements',
    stepDescription: 'Demand Curves & Price Signals',
    question: {
      prompt: 'When the market price of fresh cocoa beans increases from $1,500 to $3,000 per ton, what happens on the demand graph?',
      options: [
        { id: 'opt-a', text: 'The entire demand curve shifts to the left', label: 'A', note: 'Diagnostic distractor' },
        { id: 'opt-b', text: 'There is an upward movement along the existing demand curve (decrease in quantity demanded)', label: 'B', note: 'Correct' },
        { id: 'opt-c', text: 'The demand curve rotates 90 degrees', label: 'C' },
        { id: 'opt-d', text: 'Total supply decreases to zero', label: 'D' },
      ],
      defaultOptionId: 'opt-a',
      defaultWorking: 'Higher price means people want less, so the demand curve shifts left.',
    },
    diagnosis: {
      evidenceQuote: 'demand curve shifts to the left',
      misconception: {
        id: 'ECON-DEM-001',
        label: 'Confusing change in quantity demanded with a shift in demand',
        explanation: 'Failing to distinguish between price changes (movement along an unchanged curve) and non-price exogenous determinant shifts.',
        whyFeelsTrue: 'Both concepts involve buying less, so colloquial language merges them into "demand dropped".',
      },
    },
    probe: {
      prompt: 'Does a change in the product own price ever shift the demand curve itself?',
      options: [
        { id: 'p-opt-a', text: 'Yes, whenever price rises, demand shifts left', label: 'A', note: 'Predicted wrong rule' },
        { id: 'p-opt-b', text: 'No; price is plotted on the Y-axis, so price changes cause movement along the curve', label: 'B', note: 'Correct' },
        { id: 'p-opt-c', text: 'Only in monopoly markets', label: 'C' },
        { id: 'p-opt-d', text: "I'm not sure", label: 'D' },
      ],
      defaultProbeId: 'p-opt-a',
    },
    remediation: {
      counterexampleTitle: 'The Axis Variable Rule',
      counterexampleText: "Price is ALREADY on the vertical axis! When you change an axis variable, you just slide to a different coordinate on the SAME curve. Only non-price factors (like income, tastes, or population) shift the curve itself.",
      workedContrastIncorrect: {
        rule: 'Mistaken Rule (Price Shifts Curve)',
        example: 'ΔPrice -> Curve Shift (False)',
        desc: 'Double-counts the effect of price by both changing coordinates and relocating the schedule.',
      },
      workedContrastCorrect: {
        rule: 'Correct Rule (Movement vs Shift)',
        example: 'ΔPrice -> Movement Along; ΔTastes/Income -> Curve Shift',
        desc: 'Own-price changes alter Quantity Demanded (Qd), not the underlying Demand schedule (D).',
      },
      simulation: {
        title: 'Supply & Demand Interactive Market Curve Mover',
        description: 'Drag price sliders and demand shock toggles to observe coordinate movements vs schedule shifts.',
        type: 'economics',
      },
      practice: [
        { prompt: 'If consumer income surges and people buy more laptops at all prices, what occurs?', options: ['Movement along curve', 'Rightward shift of demand curve', 'Downward price slide'], correct: 'Rightward shift of demand curve' },
        { prompt: 'What is plotted on the horizontal axis of a standard microeconomics demand graph?', options: ['Price ($)', 'Quantity Demanded (Q)', 'Total Revenue'], correct: 'Quantity Demanded (Q)' },
        { prompt: 'If price decreases, what happens to Quantity Demanded?', options: ['Decreases', 'Increases', 'Stays constant'], correct: 'Increases' },
      ],
    },
  },

  'health-science': {
    slug: 'health-science',
    badge: 'Health Science • Immunology & Pharmacology',
    topic: 'Microbiology: Antibiotic Specificity vs Viral Pathogens',
    stepDescription: 'Cellular Targets & Antimicrobial Action',
    question: {
      prompt: 'A patient presents with acute fever, fatigue, and sore throat diagnosed as Influenza A (flu virus). Why must antibiotics NOT be prescribed?',
      options: [
        { id: 'opt-a', text: 'The virus will metabolize the antibiotics and mutate faster', label: 'A', note: 'Diagnostic distractor' },
        { id: 'opt-b', text: 'Antibiotics target bacterial peptidoglycan walls and ribosomes, having zero biological target in viruses', label: 'B', note: 'Correct' },
        { id: 'opt-c', text: 'Antibiotics only work when applied topically to the skin', label: 'C' },
        { id: 'opt-d', text: 'Antibiotics are only effective against fungal infections', label: 'D' },
      ],
      defaultOptionId: 'opt-a',
      defaultWorking: 'Antibiotics cure strong infections and colds, but viruses mutate if you use low doses.',
    },
    diagnosis: {
      evidenceQuote: 'virus will metabolize the antibiotics',
      misconception: {
        id: 'HLTH-ANT-001',
        label: 'Antibiotics kill viral infections',
        explanation: 'Treating all infectious pathogens as interchangeable "germs" that respond to antibiotics.',
        whyFeelsTrue: 'People take pills when sick and get better (from immune defense), incorrectly attributing recovery to antibiotics.',
      },
    },
    probe: {
      prompt: 'Do viral particles possess bacterial peptidoglycan cell walls or bacterial ribosomes?',
      options: [
        { id: 'p-opt-a', text: 'Yes, but they are microscopic', label: 'A', note: 'Predicted wrong rule' },
        { id: 'p-opt-b', text: 'No, viruses consist only of genetic material encased in a protein capsid, lacking bacterial structures', label: 'B', note: 'Correct' },
        { id: 'p-opt-c', text: 'Only enveloped viruses have cell walls', label: 'C' },
        { id: 'p-opt-d', text: "I'm not sure", label: 'D' },
      ],
      defaultProbeId: 'p-opt-a',
    },
    remediation: {
      counterexampleTitle: 'The Lock & Key Receptor Principle',
      counterexampleText: "Penicillin functions like a key designed to jam bacterial cell-wall construction machinery. Viruses do not build cell walls—they hijack host human cells! Prescribing antibiotics for the flu is like trying to unlock a wooden door with a computer password.",
      workedContrastIncorrect: {
        rule: 'Mistaken Rule (Antibiotics Cure All Illnesses)',
        example: 'Cold/Flu + Antibiotic = Recovery (False)',
        desc: 'Overuse destroys beneficial human gut microbiota and drives global antimicrobial resistance (AMR).',
      },
      workedContrastCorrect: {
        rule: 'Correct Rule (Antibiotics Target Bacteria Exclusively)',
        example: 'Bacteria -> Antibiotics; Viruses -> Antivirals / Vaccines / Host Immune System',
        desc: 'Drugs must bind to specific microbial biochemical targets that viruses do not possess.',
      },
      simulation: {
        title: 'Bacterial Cell Wall vs Viral Capsid Interactive Scanner',
        description: 'Test antimicrobial receptor docking on bacterial cell walls versus viral protein capsids.',
        type: 'health',
      },
      practice: [
        { prompt: 'Which of the following diseases can be cured by antibiotics?', options: ['Streptococcal pharyngitis (bacterial)', 'Common Cold (rhinovirus)', 'Measles (virus)'], correct: 'Streptococcal pharyngitis (bacterial)' },
        { prompt: 'What danger results from taking antibiotics for viral colds?', options: ['Immediate poisoning', 'Cultivating antibiotic-resistant superbugs and gut dysbiosis', 'Weakening bones'], correct: 'Cultivating antibiotic-resistant superbugs and gut dysbiosis' },
        { prompt: 'How does the human body primarily eliminate a viral flu infection?', options: ['Antibiotics', 'Adaptive immune system (antibodies & cytotoxic T-cells)', 'Drinking cold water'], correct: 'Adaptive immune system (antibodies & cytotoxic T-cells)' },
      ],
    },
  },
};
