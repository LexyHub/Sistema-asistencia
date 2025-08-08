import moment from 'moment-timezone';

/**
 * Verifica si la hora actual está dentro del rango de registro ordinario según el día de la semana (hora de Chile)
 * Lunes a jueves: 8:00-9:30 y 18:00-19:30
 * Viernes: 8:00-9:30 y 13:00-14:30
 * Sábado y domingo: bloqueado
 * @returns {boolean} true si está dentro del horario de registro ordinario
 */
export const isRegularRegistrationTime = () => {
  // Obtener la hora actual en Chile
  const now = moment().tz('America/Santiago');
  const currentHour = now.hour();
  const currentMinute = now.minute();
  const currentDay = now.day(); // 0 = domingo, 1 = lunes, ..., 6 = sábado

  // Sábado (6) y domingo (0): bloqueado
  if (currentDay === 0 || currentDay === 6) {
    return false;
  }

  // Lunes a jueves (1-4): 8:45-9:30 y 18:00-19:30
  if (currentDay >= 1 && currentDay <= 4) {
    const isMorning = (currentHour === 8 && currentMinute >= 45) || (currentHour === 9 && currentMinute <= 30);
    const isEvening = (currentHour === 18) || (currentHour === 19 && currentMinute <= 30);

      //(currentHour > 18 && currentHour < 19) || // 17:00, 18:00, 18:59
      //(currentHour === 19 && currentMinute <= 30);
    return isMorning || isEvening;
  }

  // Viernes (5): 8:45-9:30 y 13:00-14:30
  if (currentDay === 5) {
    const isMorning = (currentHour === 8 && currentMinute >= 45) || (currentHour === 9 && currentMinute <= 30);
    const isMidday = (currentHour === 13) || (currentHour === 14 && currentMinute <= 30);
    return isMorning || isMidday;
  }

  return false;
};


/**
 * Obtiene el estado de disponibilidad de los módulos
 * @returns {Object} Estado de disponibilidad de los módulos
 */
export const getModuleAvailability = (isAdmin = false) => {
  const isRegularTime = isRegularRegistrationTime();

  if (isAdmin) {
    // Admin siempre tiene acceso a todo
    return {
      regular: {
        available: true,
        className: '',
        buttonVariant: 'primary',
        iconClass: 'text-primary',
        textClass: ''
      },
      extraordinary: {
        available: true,
        className: '',
        buttonVariant: 'warning',
        iconClass: 'text-warning',
        textClass: ''
      }
    };
  }

  return {
    regular: {
      available: isRegularTime,
      className: isRegularTime ? '' : 'card-disabled',
      buttonVariant: isRegularTime ? 'primary' : 'secondary',
      iconClass: isRegularTime ? 'text-primary' : 'text-muted',
      textClass: isRegularTime ? '' : 'text-muted'
    },
    extraordinary: {
      available: !isRegularTime,
      className: !isRegularTime ? '' : 'card-disabled',
      buttonVariant: !isRegularTime ? 'warning' : 'secondary',
      iconClass: !isRegularTime ? 'text-warning' : 'text-muted',
      textClass: !isRegularTime ? '' : 'text-muted'
    }
  };
};
