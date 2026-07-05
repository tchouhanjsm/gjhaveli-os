/**
 * Core Database Driver for Google Sheets
 * This handles saving and reading data without making a mess in your main files.
 */

const DB = {
  /**
   * Automatically adds a data object to your Google Sheet matching column headers
   * @param {string} sheetName - The tab name (e.g., 'bookings')
   * @param {Object} data - E.g., { id: "B1", guest_name: "John Doe" }
   */
  insert(sheetName, data) {
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

    // Maps your data into the correct column sequence automatically
    const newRow = headers.map((header) =>
      data[header] !== undefined ? data[header] : "",
    );

    sheet.appendRow(newRow);
    return true;
  },

  /**
   * Fetches all rows from a sheet as a clean list of objects
   * @param {string} sheetName
   * @return {Array<Object>}
   */
  findAll(sheetName) {
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return []; // Returns empty list if only header row exists

    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const data = sheet
      .getRange(2, 1, lastRow - 1, sheet.getLastColumn())
      .getValues();

    return data.map((row) => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  },
};
