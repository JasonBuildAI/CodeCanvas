# CodeCanvas - Startup Script
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  CodeCanvas - Starting Services" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$ServerDir = Join-Path $PSScriptRoot "server"
$ClientDir = Join-Path $PSScriptRoot "client"

# Kill existing processes
Get-Process -Name "server" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "vite" -ErrorAction SilentlyContinue | Stop-Process -Force

# Start Backend
Write-Host "[Backend] Starting Go server on :8080..." -ForegroundColor Green
$env:JWT_SECRET = "codecanvas-dev-secret-key-2024"
$env:DB_PATH = "./codecanvas.db"
$env:CORS_ORIGIN = "http://localhost:5173"
$env:GONOSUMCHECK = "*"
$env:GOSUMDB = "off"

$job1 = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    go run ./cmd/server/main.go
} -ArgumentList $ServerDir

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[Frontend] Starting Vite dev server on :5173..." -ForegroundColor Green
$job2 = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    npx vite --host
} -ArgumentList $ClientDir

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Services Started!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor Yellow
Write-Host "  Health:   http://localhost:8080/api/health" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Gray

# Keep script running
while ($true) {
    Start-Sleep -Seconds 10
    $j1 = Receive-Job -Job $job1
    $j2 = Receive-Job -Job $job2
    if ($j1 -match "error|panic|failed") {
        Write-Host "[ERROR] Backend error detected: $j1" -ForegroundColor Red
    }
    if ($j2 -match "error") {
        Write-Host "[ERROR] Frontend error detected: $j2" -ForegroundColor Red
    }
}
