import api from './api';

// Helper function to validate date format
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
};

// Attendance service - handles all attendance-related API calls
const AttendanceService = {  // Fetch employee list for attendance registration form
  getEmployees: async () => {
    try {
      const response = await api.get('/registro-asistencia');
      let data = response.data;
      // Si la respuesta es un objeto y tiene empleados, úsala directamente
      if (data && typeof data === 'object' && Array.isArray(data.empleados)) {
        return {
          empleados: data.empleados,
          latest_date: data.latest_date || null
        };
      }
      // Si recibimos HTML, fallback (solo si es realmente HTML)
      if (typeof data === 'string' && data.includes('<html>')) {
        console.warn('⚠️ Received HTML response, attempting to extract employee data');
        data = {
          empleados: [],
          latest_date: null
        };
        return data;
      }
      // Si la estructura no es la esperada, lanza error
      throw new Error('Respuesta inesperada del backend');
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },
    // Register employee check-in/out
  registerAttendance: async (formData) => {
    try {
      // Adaptamos los datos al formato esperado por Flask
      const flaskFormData = new FormData();
      Object.keys(formData).forEach(key => {
        flaskFormData.append(key, formData[key]);
      });
      
      const response = await api.post('/guardar-asistencia', flaskFormData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error registering attendance:', error);
      throw error;
    }
  },
    // Fetch attendance data for dashboard with filtering and sorting
  getAttendanceData: async (params = {}) => {
    try {
      // Validar parámetros de entrada
      if (params.start_date && !isValidDate(params.start_date)) {
        throw new Error('Fecha de inicio inválida');
      }
      if (params.end_date && !isValidDate(params.end_date)) {
        throw new Error('Fecha de fin inválida');
      }
      
      const response = await api.get('/dashboard-asistencia', { params });
      
      // Validar estructura de respuesta
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Respuesta del servidor inválida');
      }
      
      // Mapear la respuesta de Flask a la estructura esperada por el frontend
      return {
        records: Array.isArray(response.data.records) ? response.data.records : [],
        total: response.data.total || 0,
        pagination: response.data.pagination || null
      };
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      
      // Mejorar manejo de errores específicos
      if (error.response?.status === 404) {
        throw new Error('Endpoint no encontrado');
      } else if (error.response?.status === 500) {
        throw new Error('Error interno del servidor');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Error de conexión. Verifique su conexión a internet.');
      }
      
      throw error;
    }
  },
    // Get simplified dashboard data
  getSimplifiedDashboard: async (params = {}) => {
    try {
      // Reutilizamos la ruta de dashboard-asistencia pero con un parámetro adicional
      const response = await api.get('/dashboard-asistencia', { 
        params: { ...params, simplified: true } 
      });
      // Mapear la respuesta de Flask a la estructura esperada por el frontend
      return {
        records: Array.isArray(response.data.records) ? response.data.records : []
      };
    } catch (error) {
      console.error('Error fetching simplified dashboard:', error);
      throw error;
    }
  },
  
  // Submit correction request for attendance record
  submitCorrectionRequest: async (id, formData) => {
    try {
      const response = await api.post(`/solicitar-correccion/${id}`, formData);
      return response.data;
    } catch (error) {
      console.error('Error submitting correction request:', error);
      throw error;
    }  },
  
  // Register extraordinary attendance
  registerExtraordinaryAttendance: async (formData) => {
    try {
      console.log('Datos enviados al backend:', formData);
      
      // Validar datos de entrada
      if (!formData.rut_colaborador) {
        throw new Error('RUT de empleado es requerido');
      }
      if (!formData.fecha_registro) {
        throw new Error('Fecha de registro es requerida');
      }
      if (!formData.tipo_registro) {
        throw new Error('Tipo de registro es requerido');
      }
      // Verificar tanto motivo como motivo_solicitud (adaptabilidad frontend-backend)
      if ((!formData.motivo || formData.motivo.trim().length < 10) && 
          (!formData.motivo_solicitud || formData.motivo_solicitud.trim().length < 10)) {
        throw new Error('El motivo debe tener al menos 10 caracteres');
      }

      // Validar que la fecha no sea futura
      const selectedDate = new Date(formData.fecha_registro);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Fin del día actual
      
      if (selectedDate > today) {
        throw new Error('No se pueden registrar fechas futuras');
      }

      // Validar que no sea más de 30 días atrás
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (selectedDate < thirtyDaysAgo) {
        throw new Error('No se pueden registrar fechas con más de 30 días de antigüedad');
      }

      // Validar formato de hora si se proporciona
      if (formData.hora_registro && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.hora_registro)) {
        throw new Error('Formato de hora inválido');
      }
      
      // Asegurar que se envía el campo motivo como espera el backend
      if (formData.motivo_solicitud && !formData.motivo) {
        formData.motivo = formData.motivo_solicitud;
      }      // Intentar con Content-Type: application/json
      const response = await api.post('/registro-extraordinario', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error registering extraordinary attendance:', error);
      
      // Manejar errores específicos del servidor
      if (error.response?.status === 409) {
        throw new Error('Ya existe un registro para esta fecha y empleado');
      } else if (error.response?.status === 403) {
        throw new Error('PIN incorrecto o no autorizado');
      } else if (error.response?.status === 400) {
        throw new Error('Datos incorrectos o incompletos');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw error;
    }
  },
  // Export attendance data as Excel
  exportAttendanceToExcel: async (params) => {
    try {
      // Obtener la baseURL de la configuración de variables de entorno
      const baseURL = process.env.REACT_APP_API_URL || 'https://api.v2.lexy.cl';
      
      // Construir parámetros de la URL
      const urlParams = new URLSearchParams({
        start_date: params.start_date,
        end_date: params.end_date
      });
      
      // Agregar filtro de usuario si existe
      if (params.user_rut) {
        urlParams.append('user_rut', params.user_rut);
      }
      
      window.location.href = `${baseURL}/exportar-asistencia/xlsx?${urlParams.toString()}`;
      return true;
    } catch (error) {
      console.error('Error exporting attendance to Excel:', error);
      throw error;
    }
  },
  
  // Export attendance data as CSV
  exportAttendanceToCSV: async (params) => {
    try {
      // Obtener la baseURL de la configuración de variables de entorno
      const baseURL = process.env.REACT_APP_API_URL || 'https://api.v2.lexy.cl';
      
      // Construir parámetros de la URL
      const urlParams = new URLSearchParams({
        start_date: params.start_date,
        end_date: params.end_date
      });
      
      // Agregar filtro de usuario si existe
      if (params.user_rut) {
        urlParams.append('user_rut', params.user_rut);
      }
      
      window.location.href = `${baseURL}/exportar-asistencia/csv?${urlParams.toString()}`;
      return true;
    } catch (error) {
      console.error('Error exporting attendance to CSV:', error);
      throw error;
    }
  }
};

export default AttendanceService;
