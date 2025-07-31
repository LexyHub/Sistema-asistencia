# Componentes del Sistema de Control de Asistencia

## Componentes de Diseño

### MainLayout
Componente principal que define la estructura básica de todas las páginas.

**Props:**
- `children`: Nodos React a renderizar en el contenido principal

**Ubicación:** `/components/layout/MainLayout.js`

### NavigationBar
Barra de navegación superior con enlaces a las principales secciones.

**Ubicación:** `/components/layout/NavigationBar.js`

### Footer
Pie de página con información de copyright.

**Ubicación:** `/components/layout/Footer.js`

## Componentes Comunes

### Home
Página de inicio con tarjetas de acceso a las principales funciones.

**Ubicación:** `/components/common/Home.js`

### Login
Formulario de inicio de sesión.

**Ubicación:** `/components/common/Login.js`

### NotificationList
Sistema de notificaciones toast para mensajes de éxito, error, etc.

**Props:**
- Ninguno, utiliza el contexto NotificationContext

**Ubicación:** `/components/common/NotificationList.js`

### ErrorBoundary
Captura errores de JavaScript en componentes hijos y muestra una UI de fallback.

**Props:**
- `children`: Componentes a los que se aplicará la captura de errores

**Ubicación:** `/components/common/ErrorBoundary.js`

### PrivateRoute
Protege rutas para que solo sean accesibles por usuarios autenticados.

**Props:**
- `children`: Componente a proteger
- `requiresAdmin`: Boolean, indica si se requiere rol de administrador

**Ubicación:** `/components/common/PrivateRoute.js`

## Componentes de Asistencia

### RegistroAsistenciaForm
Formulario para registrar entrada o salida.

**Ubicación:** `/components/attendance/RegistroAsistenciaForm.js`

### RegistroExtraordinario
Formulario para solicitar registros en fechas anteriores.

**Ubicación:** `/components/attendance/RegistroExtraordinario.js`

### SolicitarCorreccion
Formulario para solicitar corrección de un registro existente.

**Props:**
- Utiliza params de react-router para obtener el ID del registro a corregir

**Ubicación:** `/components/attendance/SolicitarCorreccion.js`

### RegistroExito
Página de confirmación para operaciones exitosas.

**Ubicación:** `/components/attendance/RegistroExito.js`

### RegistroError
Página de error para operaciones fallidas.

**Ubicación:** `/components/attendance/RegistroError.js`

## Componentes de Dashboard

### Dashboard
Vista principal de registros con filtros, ordenamiento y exportación.

**Ubicación:** `/components/dashboard/Dashboard.js`

### DashboardSimplificado
Vista simplificada que muestra solo registros aprobados.

**Ubicación:** `/components/dashboard/DashboardSimplificado.js`

## Componentes de Administración

### AdminCorrecciones
Panel para administrar solicitudes de corrección y registros extraordinarios.

**Ubicación:** `/components/admin/AdminCorrecciones.js`

## Contextos

### AuthContext
Gestiona el estado de autenticación del usuario.

**Propiedades y métodos:**
- `user`: Objeto con datos del usuario actual
- `isAdmin`: Boolean que indica si el usuario es administrador
- `login(userData)`: Función para iniciar sesión
- `logout()`: Función para cerrar sesión
- `isAuthenticated()`: Función que verifica si el usuario está autenticado

**Ubicación:** `/contexts/AuthContext.js`

### NotificationContext
Gestiona el sistema de notificaciones toast.

**Propiedades y métodos:**
- `notifications`: Array de notificaciones activas
- `addNotification(message, type)`: Agrega una notificación
- `removeNotification(id)`: Elimina una notificación
- `success(message)`: Atajo para notificaciones de tipo éxito
- `error(message)`: Atajo para notificaciones de tipo error
- `warning(message)`: Atajo para notificaciones de tipo advertencia
- `info(message)`: Atajo para notificaciones de tipo información

**Ubicación:** `/contexts/NotificationContext.js`

## Hooks Personalizados

### useForm
Gestiona el estado de formularios, validaciones y envío.

**Parámetros:**
- `initialValues`: Valores iniciales del formulario
- `onSubmit`: Función a ejecutar al enviar el formulario
- `validateForm`: Función opcional para validación personalizada

**Retorna:**
- `values`: Valores actuales del formulario
- `errors`: Errores de validación
- `isSubmitting`: Estado de envío
- `submitted`: Indicador si fue enviado exitosamente
- `handleChange`: Manejador de cambios en campos
- `handleSubmit`: Manejador de envío del formulario
- `resetForm`: Función para resetear formulario
- `setFieldValue`: Función para establecer un valor específico

**Ubicación:** `/hooks/useForm.js`

### usePagination
Gestiona la paginación de datos.

**Parámetros:**
- `data`: Array de datos a paginar
- `itemsPerPage`: Cantidad de elementos por página

**Retorna:**
- `currentPage`: Página actual
- `totalPages`: Total de páginas
- `paginatedData`: Datos de la página actual
- `goToPage(page)`: Ir a página específica
- `nextPage()`: Ir a página siguiente
- `prevPage()`: Ir a página anterior
- `hasPrevPage`: Boolean, indica si hay página previa
- `hasNextPage`: Boolean, indica si hay página siguiente

**Ubicación:** `/hooks/usePagination.js`
