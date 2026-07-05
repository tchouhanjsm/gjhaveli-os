import js from "@eslint/js";

export default [
  js.configurations.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Tell ESLint that these Google Apps Script constants are safe and valid
        SpreadsheetApp: "readonly",
        Logger: "readonly",
        UrlFetchApp: "readonly",
        HtmlService: "readonly",
        DB: "readonly", // Our custom global database driver
      },
    },
    rules: {
      "no-unused-vars": "warn",   // Warn you if you create a variable but don't use it
      "no-console": "off",        // Allow console/logger statements
      "semi": ["error", "always"] // Require semicolons at the end of statements
    }
  }
];