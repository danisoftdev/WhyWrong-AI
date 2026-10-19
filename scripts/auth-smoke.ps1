# WhyWrong AI - Authentication Diagnostic Ladder Smoke Test (PowerShell)
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\auth-smoke.ps1 [BASE_URL]

param (
    [string]$BaseUrl = "http://127.0.0.1:8000"
)

$ErrorActionPreference = "Stop"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "WhyWrong AI: Authentication Diagnostic Ladder" -ForegroundColor Cyan
Write-Host "Target Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# Step 1: Health Check
Write-Host -NoNewline "[Step 1/4] Probing $BaseUrl/api/health... "
try {
    $res1 = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method Get -WebSession $Session
    if ($res1.ok -eq $true) {
        Write-Host "PASSED (HTTP 200, system ok, db connected)" -ForegroundColor Green
    } else {
        Write-Host "FAILED (Unexpected payload)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "FAILED ($($_.Exception.Message))" -ForegroundColor Red
    exit 1
}

# Step 2: Anonymous CSRF
Write-Host -NoNewline "[Step 2/4] Acquiring anonymous CSRF token via /api/auth/me... "
try {
    $res2 = Invoke-RestMethod -Uri "$BaseUrl/api/auth/me" -Method Get -WebSession $Session
    $CsrfToken = $res2.csrf_token
    if (-not [string]::IsNullOrEmpty($CsrfToken)) {
        Write-Host "PASSED (CSRF token received: $($CsrfToken.Substring(0, 8))...)" -ForegroundColor Green
    } else {
        Write-Host "FAILED (No csrf_token in response)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "FAILED ($($_.Exception.Message))" -ForegroundColor Red
    exit 1
}

# Step 3: Demo Student Session
Write-Host -NoNewline "[Step 3/4] Initialising demo student session via POST /api/demo/session... "
try {
    $headers = @{
        "X-CSRF-Token" = $CsrfToken
        "Content-Type" = "application/json"
    }
    $body = @{ role = "student" } | ConvertTo-Json
    $res3 = Invoke-RestMethod -Uri "$BaseUrl/api/demo/session" -Method Post -Headers $headers -Body $body -WebSession $Session
    if ($res3.status -eq "success" -and $res3.user.role -eq "student") {
        Write-Host "PASSED (Demo student session created for $($res3.user.display_name))" -ForegroundColor Green
    } else {
        Write-Host "FAILED (Unexpected response)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "FAILED ($($_.Exception.Message))" -ForegroundColor Red
    exit 1
}

# Step 4: Verify sticky session
Write-Host -NoNewline "[Step 4/4] Verifying authenticated session via /api/auth/me... "
try {
    $res4 = Invoke-RestMethod -Uri "$BaseUrl/api/auth/me" -Method Get -WebSession $Session
    if ($res4.status -eq "success" -and $res4.user -ne $null -and $res4.user.role -eq "student") {
        Write-Host "PASSED (Role verified as $($res4.user.role), display_name: $($res4.user.display_name))" -ForegroundColor Green
    } else {
        Write-Host "FAILED (Session did not persist)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "FAILED ($($_.Exception.Message))" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "ALL 4 DIAGNOSTIC LADDER STEPS PASSED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
exit 0
