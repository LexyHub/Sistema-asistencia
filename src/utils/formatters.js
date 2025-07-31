import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Configure dayjs plugins
dayjs.extend(customParseFormat);

// Validate if a value is null, undefined, or empty
const isValidValue = (value) => {
  return value !== null && value !== undefined && value !== '' && value !== 'undefined' && value !== 'null';
};

// Format date to display in DD/MM/YYYY format
export const formatDate = (date) => {
  if (!isValidValue(date)) return '';
  try {
    const parsedDate = dayjs(date);
    if (!parsedDate.isValid()) {
      console.warn('Invalid date provided to formatDate:', date);
      return '';
    }
    return parsedDate.format('DD/MM/YYYY');
  } catch (error) {
    console.warn('Error formatting date:', date, error);
    return '';
  }
};

// Format time to display in HH:MM:SS format
export const formatTime = (time) => {
  if (!isValidValue(time)) return '';
  try {
    // Handle different time input formats
    let parsedTime;
    if (typeof time === 'string' && time.includes(':')) {
      // Parse as time string (HH:mm:ss or HH:mm)
      parsedTime = dayjs(time, 'HH:mm:ss');
      if (!parsedTime.isValid()) {
        parsedTime = dayjs(time, 'HH:mm');
      }
    } else {
      // Parse as full datetime
      parsedTime = dayjs(time);
    }
    
    if (!parsedTime.isValid()) {
      console.warn('Invalid time provided to formatTime:', time);
      return '';
    }
    return parsedTime.format('HH:mm:ss');
  } catch (error) {
    console.warn('Error formatting time:', time, error);
    return '';
  }
};

// Get current date in YYYY-MM-DD format for form inputs
export const getCurrentDate = () => {
  return dayjs().format('YYYY-MM-DD');
};

// Get current time in HH:MM format for form inputs
export const getCurrentTime = () => {
  return dayjs().format('HH:mm');
};

// Format attendance type for display (capitalize first letter)
export const formatAttendanceType = (type) => {
  if (!type || type === 'undefined' || type === 'null') return '';
  try {
    return type.toString().charAt(0).toUpperCase() + type.toString().slice(1).toLowerCase();
  } catch (error) {
    console.warn('Error formatting attendance type:', type, error);
    return '';
  }
};

// Get first day of current month in YYYY-MM-DD format
export const getFirstDayOfMonth = () => {
  return dayjs().startOf('month').format('YYYY-MM-DD');
};

// Get error message from API error response
export const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || 'An unexpected error occurred';
};

// Validate Chilean RUT format
const isValidRutFormat = (rut) => {
  // Remove any formatting
  const clean = rut.toString().replace(/[^0-9kK]/g, '');
  // RUT should have 8-9 digits + verification digit
  return clean.length >= 2 && clean.length <= 10;
};

// Format RUT with dots and dash (e.g., 12.345.678-9)
export const formatRut = (rut) => {
  if (!rut) return '';
  
  try {
    // Remove any existing formatting
    let clean = rut.toString().replace(/[^0-9kK]/g, '');
    
    // Basic validation
    if (!isValidRutFormat(rut)) {
      console.warn('Invalid RUT format:', rut);
      return rut.toString(); // Return original if invalid
    }
    
    // Get verification digit (last character)
    const dv = clean.slice(-1).toUpperCase();
    // Get main part of RUT
    const rutNumber = clean.slice(0, -1);
    
    // Format with dots every 3 digits from right to left
    let formatted = '';
    for (let i = rutNumber.length; i > 0; i -= 3) {
      const start = Math.max(0, i - 3);
      const chunk = rutNumber.slice(start, i);
      formatted = chunk + (formatted ? '.' + formatted : '');
    }
    
    return formatted + '-' + dv;
  } catch (error) {
    console.warn('Error formatting RUT:', rut, error);
    return rut.toString();
  }
};
