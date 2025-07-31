# Attendance System

Sistema de registro de asistencia con React frontend y Flask backend.

## Configuración de API

Este proyecto está configurado para trabajar con diferentes entornos usando variables de entorno:

### Entornos Disponibles

- **Desarrollo**: `https://api.v2.lexy.cl` - API de producción
- **Producción**: `https://api.v2.lexy.cl` - API de producción
- **Pruebas**: `https://api.v2.lexy.cl` - API de producción para testing

### Variables de Entorno

Las siguientes variables controlan la configuración de la API:

- `REACT_APP_API_URL`: URL base del backend API

### Archivos de Configuración

- `.env.development`: Configuración para desarrollo
- `.env.production`: Configuración para producción  
- `.env.local`: Configuración local (sobrescribe otras configuraciones)

## Scripts Disponibles

### `npm start`

Ejecuta la aplicación en modo desarrollo.\
Abre [http://localhost:3000](http://localhost:3000) para verla en el navegador.

Usa automáticamente la configuración de `.env.development`.

### `npm run build`

Construye la aplicación para producción en la carpeta `build`.\
Usa automáticamente la configuración de `.env.production`.

### `.\deploy.ps1 [entorno]`

Script de PowerShell para deployment fácil:

```powershell
# Para desarrollo
.\deploy.ps1 dev

# Para producción
.\deploy.ps1 prod

# Para pruebas con API remota
.\deploy.ps1 test

# Mostrar ayuda
.\deploy.ps1 help
```

### Testing con API Remota en Desarrollo

Para probar con la API real durante desarrollo:

1. **Opción 1**: Usar el script deploy:
   ```powershell
   .\deploy.ps1 test
   ```

2. **Opción 2**: Modificar `.env.local`:
   ```env
   REACT_APP_API_URL=https://api.v2.lexy.cl
   ```

## Backend Configuration

Asegúrate de que el backend Flask esté configurado correctamente para CORS:

```python
@api_blueprint.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response
```

## Deployment

### Para Producción

1. Ejecutar build de producción:
   ```powershell
   .\deploy.ps1 prod
   ```

2. Subir archivos de la carpeta `build/` al servidor web

3. Configurar servidor web para servir `index.html` para todas las rutas

4. Asegurar que `api.v2.lexy.cl` esté disponible y configurado

### Testing

Para probar la aplicación antes del deployment:

```powershell
# Build de prueba
.\deploy.ps1 test

# Servir localmente (requiere servidor web local)
npx serve -s build
```

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
