// @ts-check
import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "**/*.cjs",
    "**/*.config.ts",
    "**/*.esm",
    "**/*.js",
    "**/*.test.ts",
  ]),

  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [tseslint.configs.base],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Core ESLint rules
      eqeqeq: "error",
      "use-isnan": "error",
      "valid-typeof": "error",
      "no-invalid-regexp": "error",
      "no-dupe-else-if": "error",
      "no-duplicate-case": "error",
      "no-new-native-nonconstructor": "error",
      "no-unreachable": "error",
      "no-debugger": "warn",
      "require-atomic-updates": "warn",
      "no-console": ["error", { allow: ["error"] }],

      // @typescript-eslint error rules
      "@typescript-eslint/array-type": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/dot-notation": "error",
      "@typescript-eslint/no-restricted-types": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/no-array-constructor": "error",
      "@typescript-eslint/no-for-in-array": "error",
      "@typescript-eslint/no-implied-eval": "error",
      "@typescript-eslint/no-invalid-this": "error",
      "@typescript-eslint/no-invalid-void-type": "error",
      "@typescript-eslint/no-meaningless-void-operator": "error",
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/only-throw-error": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/prefer-enum-initializers": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/return-await": "error",

      // @typescript-eslint warn rules
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-loop-func": "warn",
      "@typescript-eslint/prefer-for-of": "warn",
      "@typescript-eslint/restrict-plus-operands": "warn",
      "@typescript-eslint/prefer-function-type": "warn",
      "@typescript-eslint/prefer-includes": "warn",
      "@typescript-eslint/prefer-readonly": "warn",
      "@typescript-eslint/require-array-sort-compare": "warn",
      "@typescript-eslint/no-floating-promises": [
        "warn",
        { ignoreIIFE: true },
      ],
      "@typescript-eslint/no-confusing-non-null-assertion": "warn",

      // @typescript-eslint error rules with options
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "as" },
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        { allowExpressions: true, allowIIFEs: true },
      ],
    },
  },

  // Override: disable unsafe rules for *.ts files in */src/ directories
  {
    files: ["*/src/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },

  // Override: disable unsafe rules for *.tsx files
  {
    files: ["**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },

  // Override: disable explicit-function-return-type for *.tsx files
  {
    files: ["**/*.tsx"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
]);
