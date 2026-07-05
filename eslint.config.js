import js from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  configPrettier,
  {
    files: ["src/**/*.gs", "src/**/*.js"],
    plugins: {
      prettier: prettier,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Native Google Engines
        SpreadsheetApp: "readonly",
        Logger: "readonly",
        UrlFetchApp: "readonly",
        HtmlService: "readonly",
        LockService: "readonly",
        
        // System Config & Storage Layers
        CONFIG: "writable",
        DB: "writable",
        RBAC: "writable",

        // Domain-Driven Business Services & Controllers
        BookingService: "readonly",
        BookingCtrl: "readonly",
        InvoiceCalc: "readonly",
        InvoiceCtrl: "readonly"
      },
    },
    rules: {
      "prettier/prettier": "error",
      "no-console": "off",
      "semi": ["error", "always"],
      "no-unused-vars": "off" 
    }
  }
];