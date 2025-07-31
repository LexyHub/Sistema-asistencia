import * as XLSX from 'xlsx';

/**
 * Exporta los datos del histórico de correcciones a Excel.
 * @param {Array} data - Array de objetos con los datos a exportar (ya formateados como en la tabla de histórico).
 * @param {string} fileName - Nombre base del archivo.
 */
export const exportCorreccionesToExcel = (data, fileName = 'historico_correcciones') => {
  try {
    // Crea el libro y la hoja
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-ajuste de columnas
    const maxWidths = {};
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        const value = String(row[key] || '');
        maxWidths[key] = Math.max(maxWidths[key] || 10, value.length + 2);
      });
    });
    ws['!cols'] = Object.keys(maxWidths).map(key => ({ wch: Math.min(maxWidths[key], 50) }));

    // Agrega la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Histórico');

    // Nombre con fecha
    const date = new Date().toISOString().split('T')[0];
    const fullFileName = `${fileName}_${date}.xlsx`;

    // Descarga el archivo
    XLSX.writeFile(wb, fullFileName);

    return true;
  } catch (error) {
    console.error('Error exportando a Excel:', error);
    throw new Error('Error al generar el archivo Excel');
  }
};

/**
 * Exporta los datos del histórico de correcciones a CSV.
 * @param {Array} data - Array de objetos con los datos a exportar (ya formateados como en la tabla de histórico).
 * @param {string} fileName - Nombre base del archivo.
 */
export const exportCorreccionesToCSV = (data, fileName = 'historico_correcciones') => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';' });

    // Descarga el archivo
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${date}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Error exportando a CSV:', error);
    throw new Error('Error al generar el archivo CSV');
  }
};