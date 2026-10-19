<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/vendor/autoload.php';

use WhyWrong\Database\Connection;

$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__, 2));
try {
    $dotenv->load();
} catch (\Throwable $e) {}

$db = Connection::getInstance()->getPdo();

echo "Seeding WhyWrong AI database...\n";

// Disable foreign keys during seeding
$db->exec("SET FOREIGN_KEY_CHECKS = 0;");

// Truncate tables
$tables = [
    'audit_logs', 'ai_usage', 'ai_cache', 'parent_digests', 'link_codes',
    'parent_students', 'teacher_reviews', 'agent_events', 'retests',
    'remediations', 'probes', 'diagnoses', 'attempts', 'questions',
    'misconceptions', 'class_members', 'classes', 'topics', 'subjects', 'users'
];
foreach ($tables as $t) {
    $db->exec("TRUNCATE TABLE `{$t}`;");
}

$passwordHash = password_hash('password123', PASSWORD_BCRYPT);

// 1. Users
$teacherId = 'usr-teacher-01';
$parentId  = 'usr-parent-01';
$adminId   = 'usr-admin-01';
$student1Id = 'usr-student-01'; // Kofi
$student2Id = 'usr-student-02'; // Ama

$users = [
    [$teacherId, 'teacher', 'Ms. Akua Mensah', null, 'teacher@school.edu', $passwordHash],
    [$parentId,  'parent',  'Mr. Kwesi Appiah', null, 'parent@family.edu', $passwordHash],
    [$adminId,   'admin',   'WhyWrong Administrator', null, 'admin@whywrong.ai', $passwordHash],
    [$student1Id,'student', 'Kofi Mensah', 'STU-1001', 'kofi@student.edu', $passwordHash],
    [$student2Id,'student', 'Ama Osei',    'STU-1002', 'ama@student.edu',  $passwordHash],
];

// Seed 22 additional demonstration students for class of 24
$extraNames = [
    'Kwame Asante', 'Abena Poku', 'Yaw Boakye', 'Akosua Darko', 'Kojo Frimpong',
    'Afia Boateng', 'Esi Agyeman', 'Kweku Addo', 'Yaa Owusu', 'Fiifi Quaye',
    'Baaba Amissah', 'Jojo Sam', 'Maame Serwaa', 'Panyin Tetteh', 'Kakra Tetteh',
    'Nii Aryee', 'Naa Lamiley', 'Paa Kwesi', 'Adwoa Mansa', 'Koby Sarpong',
    'Kukua Donkor', 'Eyram Gbeho'
];

$stmtUser = $db->prepare("INSERT INTO users (id, role, display_name, student_code, email, password_hash) VALUES (?, ?, ?, ?, ?, ?)");
foreach ($users as $u) {
    $stmtUser->execute($u);
}

$allStudentIds = [$student1Id, $student2Id];
$codeCounter = 1003;
foreach ($extraNames as $idx => $name) {
    $sId = sprintf('usr-student-%02d', $idx + 3);
    $code = 'STU-' . $codeCounter++;
    $email = 'student' . ($idx + 3) . '@student.edu';
    $stmtUser->execute([$sId, 'student', $name, $code, $email, $passwordHash]);
    $allStudentIds[] = $sId;
}

// 2. Class & Members
$classId = 'cls-math-form2';
$db->prepare("INSERT INTO classes (id, teacher_id, name, level) VALUES (?, ?, ?, ?)")
   ->execute([$classId, $teacherId, 'Class 2A — Mathematics & Science', 'Secondary Form 2']);

$stmtMember = $db->prepare("INSERT INTO class_members (id, class_id, student_id) VALUES (UUID(), ?, ?)");
foreach ($allStudentIds as $sid) {
    $stmtMember->execute([$classId, $sid]);
}

// 3. Parent Student Link
$db->prepare("INSERT INTO parent_students (id, parent_id, student_id, status, consent_at, linked_at) VALUES (UUID(), ?, ?, 'active', NOW(), NOW())")
   ->execute([$parentId, $student1Id]);

// 4. Subjects (All 9 Pastel Grid Subjects)
$subjects = [
    ['sbj-math', 'mathematics', 'Mathematics', 'Sigma', '#D9C2FC', 1],
    ['sbj-phys', 'physics', 'Physics', 'Zap', '#D4FBE9', 2],
    ['sbj-comp', 'computing', 'Computing', 'Code', '#FDDFE6', 3],
    ['sbj-chem', 'chemistry', 'Chemistry', 'FlaskConical', '#E3F7E0', 4],
    ['sbj-bio',  'biology', 'Biology', 'Dna', '#FEEACC', 5],
    ['sbj-eng',  'english', 'English', 'BookOpen', '#E2F1FE', 6],
    ['sbj-geo',  'geography', 'Geography', 'Globe', '#FEF5D7', 7],
    ['sbj-econ', 'economics', 'Economics', 'TrendingUp', '#ECE0FC', 8],
    ['sbj-hlth', 'health-science', 'Health Science', 'HeartPulse', '#FFEBE5', 9],
];

$stmtSub = $db->prepare("INSERT INTO subjects (id, slug, name, icon, color_token, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
foreach ($subjects as $s) {
    $stmtSub->execute($s);
}

// 5. Topics
$topics = [
    ['top-math-frac', 'sbj-math', 'fractions', 'Fractions & Ratios', 1],
    ['top-math-alg',  'sbj-math', 'algebra', 'Linear Equations', 2],
    ['top-phys-mot',  'sbj-phys', 'forces_and_motion', 'Forces and Motion', 1],
    ['top-comp-loop', 'sbj-comp', 'iteration_and_arrays', 'Loops & Array Bounds', 1],
];

$stmtTop = $db->prepare("INSERT INTO topics (id, subject_id, slug, name, sort_order) VALUES (?, ?, ?, ?, ?)");
foreach ($topics as $tp) {
    $stmtTop->execute($tp);
}

// 6. Misconceptions from verified packs
$misconceptions = [
    [
        'misc-frac-add-across', 'top-math-frac',
        'Add tops, add bottoms',
        'Adding numerators together and denominators together directly as independent integers (e.g. 1/3 + 1/4 = 2/7).',
        json_encode(['type' => 'fraction_add_across', 'pattern' => '\\b(\\d+)/(\\d+)\\s*\\+\\s*(\\d+)/(\\d+)\\s*=\\s*(\\d+)/(\\d+)\\b']),
        'verified'
    ],
    [
        'misc-frac-larger-denom-larger', 'top-math-frac',
        'Larger denominator means larger fraction',
        'Assuming 1/8 is larger than 1/4 because the whole number 8 is larger than 4.',
        json_encode(['type' => 'comparison', 'pattern' => '1/8 > 1/4']),
        'verified'
    ],
    [
        'misc-phys-force-velocity', 'top-phys-mot',
        'Constant motion requires constant net force',
        'Believing an object in uniform motion must have a continuous force pushing it forward (Aristotelian view).',
        json_encode(['type' => 'keyword_force']),
        'verified'
    ],
    [
        'misc-comp-off-by-one', 'top-comp-loop',
        'Off-by-one index boundary',
        'Assuming an array of length N has its last element at index N rather than N-1.',
        json_encode(['type' => 'array_boundary']),
        'verified'
    ]
];

$stmtMisc = $db->prepare("INSERT INTO misconceptions (id, topic_id, label, explanation, detector_json, verified_status) VALUES (?, ?, ?, ?, ?, ?)");
foreach ($misconceptions as $m) {
    $stmtMisc->execute($m);
}

// 7. Questions
$questions = [
    [
        'q-math-frac-01', 'top-math-frac',
        '\\frac{1}{3} + \\frac{1}{4} = ?',
        'katex',
        json_encode([
            ['id' => 'opt-a', 'text' => '\\frac{7}{12}', 'is_correct' => true],
            ['id' => 'opt-b', 'text' => '\\frac{2}{7}', 'misconception_id' => 'misc-frac-add-across'],
            ['id' => 'opt-c', 'text' => '\\frac{2}{12}', 'misconception_id' => null],
            ['id' => 'opt-d', 'text' => '\\frac{5}{12}', 'misconception_id' => null]
        ]),
        'opt-a',
        json_encode(['opt-b' => 'misc-frac-add-across']),
        2
    ],
    [
        'q-phys-mot-01', 'top-phys-mot',
        'A spacecraft cruises through deep space with thrusters turned off. What happens to its speed?',
        'text',
        json_encode([
            ['id' => 'opt-a', 'text' => 'It slows down gradually and eventually halts', 'misconception_id' => 'misc-phys-force-velocity'],
            ['id' => 'opt-b', 'text' => 'It continues cruising at the exact same constant speed indefinitely', 'is_correct' => true],
            ['id' => 'opt-c', 'text' => 'It accelerates because there is no gravity', 'misconception_id' => null],
            ['id' => 'opt-d', 'text' => 'It stops immediately when the thruster shuts off', 'misconception_id' => 'misc-phys-force-velocity']
        ]),
        'opt-b',
        json_encode(['opt-a' => 'misc-phys-force-velocity', 'opt-d' => 'misc-phys-force-velocity']),
        2
    ],
    [
        'q-comp-loop-01', 'top-comp-loop',
        'In JavaScript or Python, what is the index of the last element in an array with 5 items?',
        'text',
        json_encode([
            ['id' => 'opt-a', 'text' => '5', 'misconception_id' => 'misc-comp-off-by-one'],
            ['id' => 'opt-b', 'text' => '4', 'is_correct' => true],
            ['id' => 'opt-c', 'text' => '6', 'misconception_id' => null],
            ['id' => 'opt-d', 'text' => '0', 'misconception_id' => null]
        ]),
        'opt-b',
        json_encode(['opt-a' => 'misc-comp-off-by-one']),
        1
    ]
];

$stmtQ = $db->prepare("INSERT INTO questions (id, topic_id, prompt, prompt_type, options_json, correct_answer, distractor_map, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
foreach ($questions as $q) {
    $stmtQ->execute($q);
}

// 8. Seed an initial Demonstration Attempt for Kofi (2/7 wrong answer)
$attemptId = 'att-demo-kofi-01';
$db->prepare("INSERT INTO attempts (id, student_id, question_id, answer_json, working_text, is_correct) VALUES (?, ?, ?, ?, ?, ?)")
   ->execute([
       $attemptId,
       $student1Id,
       'q-math-frac-01',
       json_encode(['selected_option_id' => 'opt-b', 'selected_text' => '2/7']),
       '1/3 + 1/4 = 2/7',
       0
   ]);

$diagId = 'diag-demo-kofi-01';
$db->prepare("INSERT INTO diagnoses (id, attempt_id, misconception_id, state, evidence_quote, evidence_strength, provider, is_demo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
   ->execute([
       $diagId,
       $attemptId,
       'misc-frac-add-across',
       'suspected',
       '1/3 + 1/4 = 2/7',
       'moderate',
       'rules_engine',
       1
   ]);

// Seed probe for this diagnosis
$probeId = 'prb-demo-kofi-01';
$db->prepare("INSERT INTO probes (id, diagnosis_id, question_json, predicted_wrong, rationale, result) VALUES (?, ?, ?, ?, ?, ?)")
   ->execute([
       $probeId,
       $diagId,
       json_encode([
           'prompt' => 'If 1/5 + 1/10 = ?',
           'options' => [
               ['id' => 'p-opt-a', 'text' => '2/15'],
               ['id' => 'p-opt-b', 'text' => '3/10'],
               ['id' => 'p-opt-c', 'text' => '2/10'],
               ['id' => 'p-opt-d', 'text' => "I'm not sure"]
           ]
       ]),
       '2/15',
       'Confirms add-tops-add-bottoms if student chooses 2/15.',
       'pending'
   ]);

// Seed remediation
$db->prepare("INSERT INTO remediations (id, diagnosis_id, lesson_json, worksheet_json) VALUES (UUID(), ?, ?, ?)")
   ->execute([
       $diagId,
       json_encode([
           'counterexample' => [
               'statement' => 'If you have half a pizza (1/2) and add another half (1/2), you have 1 whole pizza, NOT 2/4 (which is half a pizza)!',
               'analogy' => 'Equal part sizes must be determined before combining.'
           ],
           'worked_contrast' => [
               'incorrect_rule' => '1/3 + 1/4 = (1+1)/(3+4) = 2/7',
               'correct_rule' => '1/3 + 1/4 = 4/12 + 3/12 = 7/12',
               'explanation' => 'Convert to a common denominator (12) before adding.'
           ]
       ]),
       json_encode(['title' => 'Fraction Strips Practice Sheet'])
   ]);

// Seed Agent Events
$events = [
    ['ingest', 'Answer received: selected 2/7 with working "1/3 + 1/4 = 2/7"'],
    ['diagnose', 'Pattern matched: Add tops, add bottoms (moderate evidence)'],
    ['probe', 'Probe generated: 1/5 + 1/10 to test pattern consistency'],
    ['remediate', 'Remediation plan prepared: Pizza counterexample & 12ths common denominator'],
    ['retest', 'Retest scheduled for +7 days']
];
$stmtEv = $db->prepare("INSERT INTO agent_events (id, diagnosis_id, stage, action, sanitized_payload, status) VALUES (UUID(), ?, ?, ?, ?, 'done')");
foreach ($events as $ev) {
    $stmtEv->execute([$diagId, $ev[0], $ev[1], json_encode(['note' => $ev[1]])]);
}

// 9. Demonstration parent digest
$db->prepare("INSERT INTO parent_digests (id, student_id, week_start, summary_json, generated_by) VALUES (UUID(), ?, CURDATE(), ?, 'rules_engine')")
   ->execute([
       $student1Id,
       json_encode([
           'summary' => 'Kofi is working on one idea about fractions.',
           'ideas_fixed' => 2,
           'practice_streak' => 4,
           'next_retest_date' => date('Y-m-d', strtotime('+5 days')),
           'help_at_home_tip' => 'Try folding strips of paper into halves and thirds together.'
       ])
   ]);

// 10. Link Code for demo
$codePlain = 'WW-8492';
$db->prepare("INSERT INTO link_codes (id, student_id, code_hash, expires_at, created_by) VALUES (UUID(), ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), ?)")
   ->execute([$student2Id, password_hash($codePlain, PASSWORD_BCRYPT), $teacherId]);

// 11. Demonstration Heatmap / Class Stats
// Seed varied student diagnoses across topics for the teacher heatmap
$miscList = ['misc-frac-add-across', 'misc-frac-larger-denom-larger', 'misc-phys-force-velocity', 'misc-comp-off-by-one'];
$qList = ['q-math-frac-01', 'q-math-frac-01', 'q-phys-mot-01', 'q-comp-loop-01'];

foreach ($allStudentIds as $idx => $sid) {
    if ($sid === $student1Id) continue;
    $miscIndex = $idx % 4;
    $targetMisc = $miscList[$miscIndex];
    $targetQ = $qList[$miscIndex];

    $isCorr = ($idx % 3 === 0) ? 1 : 0;
    $attId = "att-seed-{$idx}";
    $db->prepare("INSERT INTO attempts (id, student_id, question_id, answer_json, is_correct) VALUES (?, ?, ?, ?, ?)")
       ->execute([$attId, $sid, $targetQ, json_encode(['option' => $isCorr ? 'opt-a' : 'opt-b']), $isCorr]);

    if (!$isCorr) {
        $dId = "diag-seed-{$idx}";
        $state = ($idx % 2 === 0) ? 'suspected' : 'confirmed';
        $db->prepare("INSERT INTO diagnoses (id, attempt_id, misconception_id, state, evidence_quote, evidence_strength, provider, is_demo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)")
           ->execute([$dId, $attId, $targetMisc, $state, '2/7', 'moderate', 'rules_engine']);
    }
}

$db->exec("SET FOREIGN_KEY_CHECKS = 1;");

echo "Seeding completed successfully! (24 students, subjects, misconceptions, questions, events, and digests created)\n";
