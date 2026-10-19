# Skill: Add a Misconception Pack Entry

## When to use
When adding a new misconception to an existing subject pack or creating a new subject pack.

## File location
subject-packs/{subject}/misconceptions.json

## Required fields for each misconception entry
```json
{
  "id": "adds_numerators_and_denominators",
  "label": "Add tops, add bottoms",
  "explanation": "The student adds numerators together and denominators together instead of finding a common denominator.",
  "subject": "mathematics",
  "topic": "fractions",
  "detector": {
    "type": "distractor_id",
    "distractor_ids": ["opt_c_frac_add_1"],
    "pattern": "^(\\d+)/(\\d+)\\s*\\+\\s*(\\d+)/(\\d+)\\s*=\\s*(\\d+)/(\\d+)$",
    "pattern_check": "result_numerator == a_numerator + b_numerator AND result_denominator == a_denominator + b_denominator"
  },
  "example_wrong_answers": ["2/7", "3/11", "5/9"],
  "probe_bank": [
    {
      "id": "probe_frac_add_1",
      "question": "What is 1/5 + 1/10?",
      "options": ["2/15", "3/15", "2/10", "I'm not sure"],
      "predicted_wrong": "2/15",
      "correct": "3/15",
      "rationale": "If student picks 2/15, confirms misconception. If 3/15, slip not misconception."
    }
  ],
  "remediation_bank": {
    "counterexample": {
      "text": "If you had 1/2 a pizza and I added 1/2 a pizza, would you have 2/4 (half a pizza) or a whole pizza?",
      "visual": "fraction_strip_halves"
    },
    "worked_contrast": {
      "wrong": "1/3 + 1/4 = (1+1)/(3+4) = 2/7",
      "right": "1/3 + 1/4 = 4/12 + 3/12 = 7/12",
      "explanation": "We need the same-sized pieces (common denominator) before we can add."
    },
    "practice_ids": ["prac_frac_add_1", "prac_frac_add_2", "prac_frac_add_3"]
  },
  "prior": 0.3,
  "verified_status": "verified",
  "pack_version": "1.0.0",
  "review_required": false
}
```

## Steps
1. Write the entry following the schema above.
2. Give it a unique snake_case `id`.
3. Write at least 2 probe_bank items with `predicted_wrong` and `correct` filled.
4. Include a counterexample, worked_contrast and 3 practice_ids.
5. Set `verified_status: "verified"` only after a teacher or subject expert has reviewed.
6. Add a PHP unit test in backend/tests/ that the detector pattern matches the example_wrong_answers.
7. Add the practice question IDs to the subject's questions.json file.
8. Update the pack's README with the new entry summary.
