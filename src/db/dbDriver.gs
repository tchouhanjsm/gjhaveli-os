/**
 * Core Database Driver for Google Sheets (Thread-Safe & External Linked)
 */

const DB = {
  insert(sheetName, data) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);

      // Target the exact external linked database sheet
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error(`Sheet "${sheetName}" not found.`);

      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const newRow = headers.map((header) => (data[header] !== undefined ? data[header] : ""));

      sheet.appendRow(newRow);
      return true;
    } catch (error) {
      Logger.log(`[DB ERROR] Safe insert failed on sheet ${sheetName}: ${error.toString()}`);
      throw error;
    } finally {
      lock.releaseLock();
    }
  },

  findAll(sheetName) {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
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

  findByKey(sheetName, key, value) {
    const records = this.findAll(sheetName);
    return records.find((record) => record[key] === value) || null;
  }
};
