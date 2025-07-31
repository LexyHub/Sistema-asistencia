# Script optimizado para deployment en Vercel
# Asegura que todas las configuraciones estén correctas antes del deploy

Write-Host "🚀 Iniciando deployment optimizado a Vercel..." -ForegroundColor Green

# 1. Verificar que estamos en el directorio correcto
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: No se encuentra package.json en el directorio actual" -ForegroundColor Red
    exit 1
}

# 2. Limpiar cache y builds anteriores
Write-Host "🧹 Limpiando cache y builds anteriores..." -ForegroundColor Yellow
Remove-Item -Path ".\node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\build" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm ci

# 4. Configurar variables de entorno para build optimizado
$env:GENERATE_SOURCEMAP = 'false'
$env:CI = 'false'
$env:NODE_OPTIONS = '--max-old-space-size=4096'

# 5. Build local para verificar que funciona
Write-Host "🔨 Ejecutando build local para verificación..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build local. Revisa los errores antes de deployar." -ForegroundColor Red
    exit 1
}

# 6. Verificar archivos críticos
Write-Host "🔍 Verificando archivos críticos..." -ForegroundColor Yellow
$criticalFiles = @("build/index.html", "build/static", "vercel.json")
foreach ($file in $criticalFiles) {
    if (!(Test-Path $file)) {
        Write-Host "❌ Error: Archivo crítico faltante: $file" -ForegroundColor Red
        exit 1
    }
}

# 7. Deploy a Vercel
Write-Host "🚀 Deployando a Vercel..." -ForegroundColor Green
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment completado exitosamente!" -ForegroundColor Green
    Write-Host "🌐 Tu aplicación debería estar disponible en unos minutos." -ForegroundColor Cyan
} else {
    Write-Host "❌ Error durante el deployment. Revisa los logs de Vercel." -ForegroundColor Red
    exit 1
}
