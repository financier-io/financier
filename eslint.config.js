// @ts-check

import globals from "globals";
import vitest from "@vitest/eslint-plugin";
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.amd,
        angular: true,
        inject: true,
        VERSION: true,
        process: true,
      },
    },

    rules: {
      "no-prototype-builtins": 0,
    },
  },
  {
    files: ["**/*.spec.js"],

    languageOptions: {
      globals: vitest.environments.env.globals,
    },

    plugins: {
      vitest,
    },

    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
];
