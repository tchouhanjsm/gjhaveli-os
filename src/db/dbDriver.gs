/**
 * Core Core Database Driver for Google Sheets (Thread-Safe)
 */

const DB = {
  /**
   * Appends a row safely using Google LockService to prevent data collisions
   * @param {string} sheetName
   * @param {Object} data
   */
  insert(sheetName, data) {
    // Acquire a public script lock before touching the sheet
    const lock = LockService.getScriptLock();
    try {
      // Wait for up to 10 seconds for concurrent tasks to clear
      lock.waitLock(10000);

      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      if (!sheet) throw new Error(`Sheet "${sheetName}" not found.`);

      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const newRow = headers.map((header) => (data[header] !== undefined ? data[header] : ""));

      sheet.appendRow(newRow);
      return true;
    } catch (error) {
      Logger.log(`[DB ERROR] Safe insert failed on sheet ${sheetName}: ${error.toString()}`);
      throw error;
    } finally {
      // Always release the lock no matter what happens
      lock.releaseLock();
    }
  },

  /**
   * Fetches all records dynamically compiled as key-value objects
   * @param {string} sheetName
   * @return {Array<Object>}
   */
  findAll(sheetName) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return [];

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();

    return data.map((row) => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  },

  /**
   * Primary key lookups
   */
  findByKey(sheetName, key, value) {
    const records = this.findAll(sheetName);
    return records.find((record) => record[key] === value) || null;
  }
};
