#!/bin/bash
# Build script optimizado para Vercel deployment

echo "⚙️ Iniciando proceso de build optimizado..."

# Environment setup
echo "🌍 Configurando variables de entorno..."
export NODE_ENV=production
export REACT_APP_API_URL="https://api.v2.lexy.cl"
export CI=false
export GENERATE_SOURCEMAP=false
export INLINE_RUNTIME_CHUNK=false

# Install dependencies
echo "📦 Instalando dependencias..."
npm ci

# Clean build folder if it exists
if [ -d "build" ]; then
  echo "🧹 Limpiando build anterior..."
  rm -rf build
fi

# Run build with optimizations
echo "🏗️ Ejecutando build con optimizaciones..."
npm run build

# Verify build output
if [ -d "build" ] && [ -f "build/index.html" ]; then
  echo "✅ Build completado exitosamente"
  echo "📁 Contenido del directorio build:"
  ls -la build/
else
  echo "❌ Error: Build falló - directorio build no encontrado"
  exit 1
fi

echo "🚀 Build listo para deployment en Vercel"
echo "🔨 Building application..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Verify build
if [ -d "build" ]; then
  echo "✅ Build completed successfully."
else
  echo "❌ Build failed. Check logs for errors."
  exit 1
fi

# Optimize for Vercel deployment
echo "🔧 Optimizing for deployment..."
touch build/.nojekyll  # Ensures GitHub Pages doesn't process the files

# Copy index.html to 404.html for SPA routing
cp build/index.html build/404.html

echo "🚀 Build ready for deployment!"
