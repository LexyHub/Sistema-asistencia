@echo off
echo Iniciando servidor de desarrollo React...
echo.

REM Limpiar procesos previos
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Configurar variables de entorno
set GENERATE_SOURCEMAP=false
set FAST_REFRESH=true
set CHOKIDAR_USEPOLLING=false

echo Variables de entorno configuradas
echo.

REM Iniciar el servidor
echo Iniciando servidor en puerto 3000...
npm start

pause
