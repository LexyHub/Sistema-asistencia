# deploy.ps1 - Script para deployment de la aplicación React

Write-Host "=== Deployment Script para Attendance System ===" -ForegroundColor Cyan

# Función para mostrar ayuda
function Show-Help {
    Write-Host ""
    Write-Host "Uso: .\deploy.ps1 [opción]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Green
    Write-Host "  dev       - Build para desarrollo (localhost:5000)"
    Write-Host "  prod      - Build para producción (api.v2.lexy.cl)"
    Write-Host "  test      - Build para pruebas con API remota"
    Write-Host "  help      - Mostrar esta ayuda"
    Write-Host ""
}

# Verificar parámetros
param(
    [string]$Environment = ""
)

if ($Environment -eq "" -or $Environment -eq "help") {
    Show-Help
    exit
}

# Configurar variables según el entorno
switch ($Environment.ToLower()) {    "dev" {
        Write-Host "Configurando para DESARROLLO..." -ForegroundColor Green
        $env:REACT_APP_API_URL = "https://api.v2.lexy.cl"
        $buildType = "desarrollo"
    }
    "prod" {
        Write-Host "Configurando para PRODUCCIÓN..." -ForegroundColor Green
        $env:REACT_APP_API_URL = "https://api.v2.lexy.cl"
        $buildType = "producción"
    }
    "test" {
        Write-Host "Configurando para PRUEBAS con API remota..." -ForegroundColor Green
        $env:REACT_APP_API_URL = "https://api.v2.lexy.cl"
        $buildType = "pruebas"
    }
    default {
        Write-Host "Error: Entorno no válido. Use 'dev', 'prod', 'test' o 'help'" -ForegroundColor Red
        Show-Help
        exit 1
    }
}

Write-Host ""
Write-Host "Configuración actual:" -ForegroundColor Yellow
Write-Host "  API URL: $env:REACT_APP_API_URL" -ForegroundColor White
Write-Host ""

# Verificar si npm está instalado
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npm no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Instalar dependencias si no existen
if (!(Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
}

# Ejecutar el build
Write-Host "Iniciando build para $buildType..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "¡Build completado exitosamente!" -ForegroundColor Green
    Write-Host "Archivos generados en la carpeta 'build/'" -ForegroundColor White
    
    if ($Environment.ToLower() -eq "prod") {
        Write-Host ""
        Write-Host "IMPORTANTE para producción:" -ForegroundColor Cyan
        Write-Host "1. Sube los archivos de la carpeta 'build/' a tu servidor web" -ForegroundColor White
        Write-Host "2. Configura tu servidor web para servir index.html para todas las rutas" -ForegroundColor White
        Write-Host "3. Asegúrate de que api.v2.lexy.cl esté disponible y configurado" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "Error durante el build" -ForegroundColor Red
    exit 1
}
