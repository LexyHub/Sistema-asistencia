/**
 * Utilidades de validación y sanitización de datos
 */

// Sanitizar string para prevenir XSS
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/[<>]/g, '') // Remover caracteres HTML básicos
    .replace(/javascript:/gi, '') // Remover javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remover event handlers
    .trim();
};

// Validar formato de RUT chileno
export const validateRut = (rut) => {
  if (!rut) return false;
  
  // Limpiar formato
  const cleanRut = rut.replace(/[.\-]/g, '');
  
  // Verificar formato básico
  if (!/^\d{7,8}[0-9kK]$/.test(cleanRut)) {
    return false;
  }
  
  const rutDigits = cleanRut.slice(0, -1);
  const checkDigit = cleanRut.slice(-1).toLowerCase();
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = rutDigits.length - 1; i >= 0; i--) {
    sum += parseInt(rutDigits[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const calculatedDigit = remainder === 0 ? '0' : remainder === 1 ? 'k' : (11 - remainder).toString();
  
  return calculatedDigit === checkDigit;
};

// Validar formato de email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar rango de fechas
export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, message: 'Formato de fecha inválido' };
  }
  
  if (start > end) {
    return { valid: false, message: 'La fecha de inicio debe ser anterior a la fecha de fin' };
  }
  
  // Verificar que no sea más de 1 año de rango
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  if ((end - start) > oneYear) {
    return { valid: false, message: 'El rango de fechas no puede ser mayor a 1 año' };
  }
  
  return { valid: true };
};

// Validar horario laboral (formato HH:MM)
export const validateWorkTime = (time) => {
  if (!time) return false;
  
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) return false;
  
  const [hours, minutes] = time.split(':').map(Number);
  
  // Validar horario laboral típico (06:00 - 23:00)
  if (hours < 6 || hours > 23) {
    return false;
  }
  
  return true;
};

// Validar longitud de texto con límites
export const validateTextLength = (text, min = 0, max = 1000) => {
  if (!text && min > 0) {
    return { valid: false, message: `El texto debe tener al menos ${min} caracteres` };
  }
  
  if (text && text.length < min) {
    return { valid: false, message: `El texto debe tener al menos ${min} caracteres` };
  }
  
  if (text && text.length > max) {
    return { valid: false, message: `El texto no puede exceder ${max} caracteres` };
  }
  
  return { valid: true };
};

// Validar PIN numérico
export const validatePin = (pin) => {
  if (!pin) return false;
  
  // Solo números, longitud entre 4 y 8 dígitos
  const pinRegex = /^\d{4,8}$/;
  return pinRegex.test(pin);
};

// Limpiar y validar parámetros de URL
export const sanitizeUrlParams = (params) => {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      // Sanitizar valor
      const cleanValue = typeof value === 'string' ? sanitizeString(value) : value;
      
      // Validar tipos específicos
      if (key.includes('date') && typeof cleanValue === 'string') {
        const date = new Date(cleanValue);
        if (!isNaN(date.getTime())) {
          cleaned[key] = cleanValue;
        }
      } else if (key.includes('id') && typeof cleanValue === 'string') {
        // IDs deben ser números o strings alfanuméricos
        if (/^[a-zA-Z0-9_-]+$/.test(cleanValue)) {
          cleaned[key] = cleanValue;
        }
      } else {
        cleaned[key] = cleanValue;
      }
    }
  }
  
  return cleaned;
};

// Validar estructura de datos de asistencia
export const validateAttendanceData = (data) => {
  const required = ['person_id', 'tipo_registro'];
  const errors = {};
  
  for (const field of required) {
    if (!data[field]) {
      errors[field] = `${field} es requerido`;
    }
  }
  
  // Validaciones específicas
  if (data.tipo_registro && !['entrada', 'salida'].includes(data.tipo_registro)) {
    errors.tipo_registro = 'Tipo de registro inválido';
  }
  
  if (data.fecha_registro) {
    const date = new Date(data.fecha_registro);
    if (isNaN(date.getTime())) {
      errors.fecha_registro = 'Formato de fecha inválido';
    }
  }
  
  if (data.hora_registro && !validateWorkTime(data.hora_registro)) {
    errors.hora_registro = 'Formato u horario de trabajo inválido';
  }
  
  if (data.pin && !validatePin(data.pin)) {
    errors.pin = 'PIN debe ser numérico entre 4 y 8 dígitos';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  sanitizeString,
  validateRut,
  validateEmail,
  validateDateRange,
  validateWorkTime,
  validateTextLength,
  validatePin,
  sanitizeUrlParams,
  validateAttendanceData
};
