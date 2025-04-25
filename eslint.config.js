import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginJest from "eslint-plugin-jest";
import { defineConfig } from "eslint/config";
import noConsoleLog from "./eslint-rules/no-console-log.js"; // Import the custom rule

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: {
      js,
      react: pluginReact,
    },
    extends: ["js/recommended"],
    rules: {
      "react/prop-types": "off",
      "no-console-log": "error", // Enable the custom rule
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
    },
  },
  {
    ...pluginReact.configs.flat.recommended,
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    rules: {
      "no-console-log": noConsoleLog, // Register the custom rule
    },
  },
]);
