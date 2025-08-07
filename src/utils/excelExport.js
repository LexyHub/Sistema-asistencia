import * as XLSX from 'xlsx';
import { formatDate, formatTime, formatAttendanceType } from './formatters';
import AttendanceService from '../services/attendanceService';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
/**
 * Export attendance data to Excel file
 * @param {Array} data - Array of attendance records
 * @param {string} fileName - Name of the file to download
 * @param {Object} options - Export options (startDate, endDate, etc.)
 */
export const exportToExcel = async (data, fileName = 'asistencia', options = {}) => {
  try {
    // Procesar hoja principal de asistencia
    const excelData = data.map(record => ({
      'Fecha': formatDate(record.fecha_display || record.fecha) || 'N/A',
      'Nombre': record.nombre_colaborador || 'N/A',
      'RUT': record.rut_colaborador || 'N/A',
      'Tipo': formatAttendanceType(record.tipo_registro) || 'N/A',
      'Hora': formatTime(record.hora_display || record.hora) || 'N/A',
      'Origen': record.origen_registro || 'Normal',
      'ID Registro': record.id_registro || 'N/A'
    }));

    // Crear workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Autosize columnas
    const maxWidths = {};
    excelData.forEach(row => {
      Object.keys(row).forEach(key => {
        const value = String(row[key] || '');
        maxWidths[key] = Math.max(maxWidths[key] || 10, value.length + 2);
      });
    });
    ws['!cols'] = Object.keys(maxWidths).map(key => ({ wch: Math.min(maxWidths[key], 50) }));

    // Header styling
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "CCCCCC" } },
        alignment: { horizontal: "center" }
      };
    }

    // Hoja de resumen si aplica
    if (options.startDate || options.endDate) {
      const resumenData = [{
        'Fecha de generación': new Date().toLocaleString('es-CL'),
        'Período': `${options.startDate || 'Inicio'} - ${options.endDate || 'Fin'}`,
        'Total de registros': excelData.length
      }];
      const metaWs = XLSX.utils.json_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(wb, metaWs, 'Información');
    }

    // 👉 Hoja adicional "Data" desde la API
    try {
      console.log("inicio segunda request")
      console.log(data)
      const newData = {"records": data}
      const processedData = await AttendanceService.processData(newData);
      if (Array.isArray(processedData.detalle_diario) && processedData.detalle_diario.length > 0) {
        const dataSheet = XLSX.utils.json_to_sheet(processedData.detalle_diario);
        const dataSheet1 = XLSX.utils.json_to_sheet(processedData.resumen_colaboradores);
        XLSX.utils.book_append_sheet(wb, dataSheet, 'Detalle Diario');
        XLSX.utils.book_append_sheet(wb, dataSheet1, 'Resumen Colaboradores');
      }
    } catch (err) {
      console.warn('No se pudo agregar la hoja de data procesada:', err.message);
      // Puedes omitir o agregar una hoja vacía si quieres
    }

    // Agregar hoja principal
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');

    const date = new Date().toISOString().split('T')[0];
    const fullFileName = `${fileName}_${date}.xlsx`;

    XLSX.writeFile(wb, fullFileName);
    return true;

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Error al generar el archivo Excel');
  }
};

/**
 * Export attendance data to CSV file
 * @param {Array} data - Array of attendance records
 * @param {string} fileName - Name of the file to download
 */
export const exportToCSV = async (data, fileName = 'asistencia') => {
  try {
    // 1) CSV principal (asistencia)
    const csvData = data.map(record => ({
      'Fecha': formatDate(record.fecha_display || record.fecha) || 'N/A',
      'Nombre': record.nombre_colaborador || 'N/A',
      'RUT': record.rut_colaborador || 'N/A',
      'Tipo': formatAttendanceType(record.tipo_registro) || 'N/A',
      'Hora': formatTime(record.hora_display || record.hora) || 'N/A',
      'Origen': record.origen_registro || 'Normal',
      'ID Registro': record.id_registro || 'N/A'
    }));
    const ws = XLSX.utils.json_to_sheet(csvData);
    const mainCsv = XLSX.utils.sheet_to_csv(ws, { FS: ';' }); // ; para Excel

    // 2) Llamada a la API para data procesada
    let detalleCsv = null;
    let resumenCsv = null;
    try {
      const newData = { records: data };
      const processedData = await AttendanceService.processData(newData);

      if (Array.isArray(processedData?.detalle_diario) && processedData.detalle_diario.length > 0) {
        const wsDetalle = XLSX.utils.json_to_sheet(processedData.detalle_diario);
        detalleCsv = XLSX.utils.sheet_to_csv(wsDetalle, { FS: ';' });
      }
      if (Array.isArray(processedData?.resumen_colaboradores) && processedData.resumen_colaboradores.length > 0) {
        const wsResumen = XLSX.utils.json_to_sheet(processedData.resumen_colaboradores);
        resumenCsv = XLSX.utils.sheet_to_csv(wsResumen, { FS: ';' });
      }
    } catch (e) {
      console.warn('No se pudo obtener data procesada para CSV:', e?.message || e);
    }

    // 3) Empaquetar todo en un ZIP
    const date = new Date().toISOString().split('T')[0];
    const base = `${fileName}_${date}`;
    const zip = new JSZip();

    // Agregar BOM para que Excel respete UTF-8
    const bom = '\ufeff';

    zip.file(`${base}_asistencia.csv`, bom + mainCsv);
    if (detalleCsv) zip.file(`${base}_detalle_diario.csv`, bom + detalleCsv);
    if (resumenCsv) zip.file(`${base}_resumen_colaboradores.csv`, bom + resumenCsv);

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${base}.zip`);

    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Error al generar el archivo CSV');
  }
};
/**
 * Generate summary statistics from attendance data
 * @param {Array} data - Array of attendance records
 * @returns {Object} Summary statistics
 */
export const generateSummaryStats = (data) => {
  const stats = {
    totalRecords: data.length,
    byType: {},
    byEmployee: {},
    byDate: {},
    byOrigin: {}
  };

  data.forEach(record => {
    // Count by type
    const type = formatAttendanceType(record.tipo_registro) || 'Desconocido';
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    // Count by employee
    const employee = record.nombre_colaborador || 'Desconocido';
    stats.byEmployee[employee] = (stats.byEmployee[employee] || 0) + 1;

    // Count by date
    const date = formatDate(record.fecha_display || record.fecha) || 'Desconocido';
    stats.byDate[date] = (stats.byDate[date] || 0) + 1;

    // Count by origin
    const origin = record.origen_registro || 'Normal';
    stats.byOrigin[origin] = (stats.byOrigin[origin] || 0) + 1;
  });

  return stats;
};
