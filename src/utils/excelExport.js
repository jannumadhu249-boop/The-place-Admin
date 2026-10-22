import * as XLSX from 'xlsx';

/**
 * Exports data to an Excel (.xlsx) file with auto-calculated column widths
 * and proper string formatting so dates and long text never display as '###'.
 * 
 * @param {Array<Object>} data - Array of row objects
 * @param {string} fileName - Base name of the exported file
 * @param {string} sheetName - Name of the worksheet tab
 */
export const exportToExcel = (data, fileName = 'export', sheetName = 'Sheet1') => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // Generate worksheet from JSON
  const ws = XLSX.utils.json_to_sheet(data);

  // Compute optimal column widths to avoid '###' (hash) in Excel
  const colKeys = Object.keys(data[0] || {});
  const colWidths = colKeys.map((key) => {
    let maxLen = String(key).length;
    data.forEach((row) => {
      const val = row[key];
      const str = val !== null && val !== undefined ? String(val) : '';
      if (str.length > maxLen) {
        maxLen = str.length;
      }
    });
    // Add comfortable padding: minimum 14 chars, maximum 65 chars
    return { wch: Math.min(Math.max(maxLen + 4, 14), 65) };
  });

  ws['!cols'] = colWidths;

  // Create workbook and append sheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Write and download true .xlsx file
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};
