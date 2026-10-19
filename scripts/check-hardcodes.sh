#!/usr/bin/env bash
# WhyWrong AI - Hardcode & Secret Scanner
# Exits with 0 if clean, 1 if violations found.

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "=== Running Hardcode & Secret Audits ==="
ERRORS=0

# 1. Check for real API key leaks (Anthropic, OpenAI sk-, Google AIza)
echo -n "Checking for raw API keys... "
if grep -rnEI "(AIzaSy[0-9A-Za-z_-]{33}|sk-[a-zA-Z0-9]{20,})" \
   --exclude-dir={.git,node_modules,vendor,docs,storage} \
   --exclude="*.example.*" .; then
    echo "FAILED! Found suspected active API key."
    ERRORS=$((ERRORS + 1))
else
    echo "PASSED"
fi

# 2. Check for Anthropic / Claude references (hard rule: STRICTLY FORBIDDEN)
echo -n "Checking for Anthropic / Claude references... "
if grep -rnEI "(anthropic|claude-3|claude-v1|claude-instant)" \
   --exclude-dir={.git,node_modules,vendor,docs,storage} \
   --exclude="check-hardcodes.sh" \
   --exclude="AGENTS.md" \
   --exclude="HARDCODE_REPORT.md" \
   --exclude="MIGRATION_NOTES.md" .; then
    echo "FAILED! Forbidden Anthropic / Claude reference detected."
    ERRORS=$((ERRORS + 1))
else
    echo "PASSED"
fi

# 3. Check for hardcoded password assignments in source code
echo -n "Checking for hardcoded password strings... "
if grep -rnEI "password\s*=\s*['\"][^'\"]+['\"]" \
   --exclude-dir={.git,node_modules,vendor,docs,storage} \
   --exclude="*.example.*" \
   --exclude="HARDCODE_REPORT.md" \
   --exclude="MIGRATION_NOTES.md" \
   --exclude="seed*.php" .; then
    echo "FAILED! Plaintext password assignment found."
    ERRORS=$((ERRORS + 1))
else
    echo "PASSED"
fi

# 4. Check for arbitrary hardcoded external URLs in frontend code (excluding imports and docs)
echo -n "Checking for raw URLs in frontend logic... "
if grep -rnEI "https?://(?!localhost|127\.0\.0\.1)" \
   --include="*.tsx" --include="*.ts" \
   --exclude-dir={node_modules,docs} \
   frontend/src/features/ frontend/src/services/; then
    echo "FAILED! External URLs hardcoded in frontend features."
    ERRORS=$((ERRORS + 1))
else
    echo "PASSED"
fi

echo "========================================"
if [ $ERRORS -eq 0 ]; then
    echo "ALL AUDIT CHECKS PASSED: Codebase is clean of hardcoded secrets and unmanaged values."
    exit 0
else
    echo "AUDIT FAILED with $ERRORS error(s)."
    exit 1
fi
