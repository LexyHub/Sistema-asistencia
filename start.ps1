# PowerShell script to start the application

Write-Host "====================================" -ForegroundColor Green
Write-Host "Sistema de Control de Asistencia" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/"
    exit 1
}

# Check if npm is installed
if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npm is not installed." -ForegroundColor Red
    Write-Host "Please install npm (usually comes with Node.js)"
    exit 1
}

# Check Node version
$nodeVersion = (node -v).Substring(1)
$nodeMajorVersion = [int]$nodeVersion.Split('.')[0]
if ($nodeMajorVersion -lt 16) {
    Write-Host "Warning: You are using Node.js v$nodeVersion" -ForegroundColor Yellow
    Write-Host "It is recommended to use Node.js v16.x or higher" -ForegroundColor Yellow
}

Write-Host "Starting application..." -ForegroundColor Green
Write-Host "Using production API at https://api.v2.lexy.cl" -ForegroundColor Yellow
Write-Host ""

# Start the application
npm start
