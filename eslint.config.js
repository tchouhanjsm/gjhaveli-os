import js from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  configPrettier, // Disables ESLint rules that might conflict with Prettier
  {
    files: ["src/**/*.gs", "src/**/*.js"],
    plugins: {
      prettier: prettier,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        SpreadsheetApp: "readonly",
        Logger: "readonly",
        UrlFetchApp: "readonly",
        HtmlService: "readonly",
        LockService: "readonly",
        CONFIG: "writable",
        DB: "writable",
        RBAC: "writable"
      },
    },
    rules: {
      "prettier/prettier": "error", // Throws an error if code isn't formatted cleanly
      "no-console": "off",
      "semi": ["error", "always"],
      // Modify unused-vars to ignore top-level global variables unique to Apps Script
      "no-unused-vars": "off"
    }
  }
];