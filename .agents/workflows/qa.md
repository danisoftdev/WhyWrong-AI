# QA Workflow (/qa)

Follow this workflow to verify the WhyWrong system before deployment or demonstration.

## 1. Automated Builds & Lint
- Run PHP syntax check: `find backend/src -name "*.php" -exec php -l {} +`
- Run PHPUnit tests: `cd backend && ./vendor/bin/phpunit tests/`
- Run Frontend typecheck and build: `cd frontend && npm run build`

## 2. Parity Test (WhyWrong Engine vs LLM API)
- Run parity benchmark: `php eval/parity_test.php`
- Check that evidence quotes are 100% valid substrings.
- Confirm distractor-matched items achieve 100% diagnostic accuracy.

## 3. Six-Stage Loop Verification
1. **Diagnosis**: Submit wrong answer `1/3 + 1/4 = 2/7`. Confirm status is `suspected` (never `confirmed`).
2. **Evidence**: Verify evidence quote `1/3 + 1/4 = 2/7` matches submitted text.
3. **Probes**: Verify probe generated with predicted distractor.
4. **Hypothesis Update**: Contradicting answer lowers or rejects misconception.
5. **Remediation**: Verify counterexample and fraction-strip component.
6. **Teacher & Parent**: Verify teacher review changes status; verify parent cannot see unaccepted diagnoses.

## 4. Mobile Responsiveness
- Test layout at 360px viewport width (no horizontal scrolling).
