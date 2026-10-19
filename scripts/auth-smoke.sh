#!/usr/bin/env bash
# WhyWrong AI - Authentication Diagnostic Ladder Smoke Test
# Usage: ./scripts/auth-smoke.sh [BASE_URL]
# Example: ./scripts/auth-smoke.sh http://127.0.0.1:8000
# Example: ./scripts/auth-smoke.sh https://whywrong.freepage.cc

set -e

BASE_URL="${1:-http://127.0.0.1:8000}"
COOKIE_JAR="$(mktemp -t ww_jar_XXXXXX.txt 2>/dev/null || echo 'ww_jar.txt')"
trap 'rm -f "$COOKIE_JAR"' EXIT

echo "========================================================"
echo "WhyWrong AI: Authentication Diagnostic Ladder"
echo "Target Base URL: $BASE_URL"
echo "========================================================"
echo ""

# ------------------------------------------------------------------
# STEP 1: Health Check
# ------------------------------------------------------------------
echo -n "[Step 1/4] Probing $BASE_URL/api/health... "
HEALTH_RESP=$(curl -s -i -w "\n%{http_code}" "$BASE_URL/api/health" || true)
HTTP_CODE=$(echo "$HEALTH_RESP" | tail -n1)
BODY=$(echo "$HEALTH_RESP" | head -n -1)

if [ "$HTTP_CODE" -ne 200 ]; then
    echo "FAILED! (HTTP $HTTP_CODE)"
    echo "Error: /api is not reaching PHP. Check hosting, fastcgi, or .htaccess rewrite rules."
    echo "$BODY"
    exit 1
fi

if ! echo "$BODY" | grep -q '"ok":true'; then
    echo "FAILED! (Unexpected response body)"
    echo "$BODY"
    exit 1
fi
echo "PASSED (HTTP 200, system ok, db connected)"

# ------------------------------------------------------------------
# STEP 2: Anonymous CSRF & Session Acquisition
# ------------------------------------------------------------------
echo -n "[Step 2/4] Acquiring anonymous CSRF token & cookie via /api/auth/me... "
ME_RESP=$(curl -s -i -c "$COOKIE_JAR" "$BASE_URL/api/auth/me" || true)
ME_CODE=$(echo "$ME_RESP" | grep -E '^HTTP/' | tail -n1 | awk '{print $2}')

if [ "$ME_CODE" -ne 200 ]; then
    echo "FAILED! (HTTP $ME_CODE)"
    echo "Error: /api/auth/me did not return 200. Unauthenticated clients cannot get a CSRF token."
    echo "$ME_RESP"
    exit 1
fi

CSRF_TOKEN=$(echo "$ME_RESP" | grep -o '"csrf_token":"[^"]*' | cut -d'"' -f4 || true)
if [ -z "$CSRF_TOKEN" ]; then
    echo "FAILED! (Could not extract csrf_token from /api/auth/me response)"
    echo "$ME_RESP"
    exit 1
fi

if ! grep -q "ww_session" "$COOKIE_JAR" 2>/dev/null && ! echo "$ME_RESP" | grep -iq "set-cookie"; then
    echo "WARNING: Set-Cookie header missing in response."
fi
echo "PASSED (CSRF token received: ${CSRF_TOKEN:0:8}...)"

# ------------------------------------------------------------------
# STEP 3: Demo Student Session Initialisation
# ------------------------------------------------------------------
echo -n "[Step 3/4] Initialising demo student session via POST /api/demo/session... "
DEMO_RESP=$(curl -s -i -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
    -X POST "$BASE_URL/api/demo/session" \
    -H "Content-Type: application/json" \
    -H "X-CSRF-Token: $CSRF_TOKEN" \
    -d '{"role":"student"}' || true)
DEMO_CODE=$(echo "$DEMO_RESP" | grep -E '^HTTP/' | tail -n1 | awk '{print $2}')

if [ "$DEMO_CODE" -ne 200 ] && [ "$DEMO_CODE" -ne 201 ]; then
    echo "FAILED! (HTTP $DEMO_CODE)"
    if [ "$DEMO_CODE" -eq 403 ]; then
        echo "Error: 403 Forbidden indicates CSRF token mismatch or missing header."
    elif [ "$DEMO_CODE" -eq 404 ]; then
        echo "Error: 404 Not Found indicates demo mode is disabled or database seeds missing."
    fi
    echo "$DEMO_RESP"
    exit 1
fi
echo "PASSED (HTTP $DEMO_CODE, demo session established)"

# ------------------------------------------------------------------
# STEP 4: Session Stickiness Verification
# ------------------------------------------------------------------
echo -n "[Step 4/4] Verifying authenticated session via /api/auth/me... "
VERIFY_RESP=$(curl -s -i -b "$COOKIE_JAR" "$BASE_URL/api/auth/me" || true)
VERIFY_CODE=$(echo "$VERIFY_RESP" | grep -E '^HTTP/' | tail -n1 | awk '{print $2}')

if [ "$VERIFY_CODE" -ne 200 ]; then
    echo "FAILED! (HTTP $VERIFY_CODE)"
    echo "Error: Session did not stick across requests. Check cookie flags (HttpOnly/Secure/SameSite/Domain)."
    echo "$VERIFY_RESP"
    exit 1
fi

if ! echo "$VERIFY_RESP" | grep -q '"role":"student"'; then
    echo "FAILED! (Expected role 'student' in session)"
    echo "$VERIFY_RESP"
    exit 1
fi
echo "PASSED (Role 'student' verified, session cookie is sticky)"

echo ""
echo "========================================================"
echo "ALL 4 DIAGNOSTIC LADDER STEPS PASSED SUCCESSFULLY!"
echo "WhyWrong authentication is verified operational."
echo "========================================================"
exit 0
