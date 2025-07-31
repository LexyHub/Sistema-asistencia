/**
 * Constants for page titles and descriptions
 */

const APP_NAME = process.env.REACT_APP_APP_NAME || 'Sistema de Control de Asistencia';

// Page titles
export const PAGE_TITLES = {
  HOME: 'Inicio',
  LOGIN: 'Iniciar Sesión',
  REGISTER_ATTENDANCE: 'Registro de Asistencia',
  EXTRAORDINARY_ATTENDANCE: 'Registro Extraordinario',
  DASHBOARD: 'Dashboard de Asistencia',
  SIMPLIFIED_DASHBOARD: 'Registros Aprobados',
  CORRECTION_REQUEST: 'Solicitar Corrección',
  ADMIN_CORRECTIONS: 'Administración de Correcciones',
  SUCCESS: 'Operación Exitosa',
  ERROR: 'Error'
};

// Page descriptions
export const PAGE_DESCRIPTIONS = {
  HOME: 'Sistema de control y gestión de asistencia de empleados',
  LOGIN: 'Acceda al sistema con sus credenciales',
  REGISTER_ATTENDANCE: 'Registre su entrada o salida diaria',
  EXTRAORDINARY_ATTENDANCE: 'Solicite un registro de asistencia en fechas pasadas',
  DASHBOARD: 'Visualice y gestione los registros de asistencia',
  SIMPLIFIED_DASHBOARD: 'Visualice solo los registros aprobados',
  CORRECTION_REQUEST: 'Solicite la corrección de un registro de asistencia',
  ADMIN_CORRECTIONS: 'Gestione las solicitudes de correcciones y registros extraordinarios',
  SUCCESS: 'La operación se ha completado exitosamente',
  ERROR: 'Ha ocurrido un error al procesar la operación'
};

export const getFullPageTitle = (pageTitle) => {
  return pageTitle ? `${pageTitle} | ${APP_NAME}` : APP_NAME;
};
