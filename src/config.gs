/**
 * Global Application Configurations
 * gjhaveli-os
 */

const CONFIG = {
  SPREADSHEET_ID: "1tQcjQzYYpSrEOkJFsfY_YVddNVgvL2UeRxIsS4c05BE",

  // Google Drive Folder ID to drop generated PDF files
  INVOICE_DRIVE_FOLDER_ID: "1nEmAKa_FXjjEF2rCeYbaazZ_cqRagvLs",

  // Optional invoice-generator.com Bearer API Key (leave empty if using the free tier)
  INVOICE_GENERATOR_API_KEY: "",

  APP_NAME: "GarhJaisal Operating System (gjhaveli-os)",
  VERSION: "1.0.0",

  // Corporate Billing Profile (Maps to the "From" field on invoice-generator.com)
  HOTEL_BILLING_FROM: "Garh Jaisal Haveli\nJaisalmer, Rajasthan, India\nGSTIN: 08AAAAA0000A1Z1",

  TAX_RATE_GST: 5, // 5% GST Rule

  SHEETS: {
    ROOMS: "rooms",
    BOOKINGS: "bookings",
    INVOICES: "invoices",
    EXPENSES: "expenses",
    USERS: "users"
  },

  ROLES: {
    ADMIN: "admin",
    MANAGER: "manager",
    STAFF: "staff"
  }
};
