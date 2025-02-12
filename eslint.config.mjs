// @ts-check
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  ...svelte.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // Seemingly not defined in `globals.browser`
        ScrollBehavior: 'readonly',
      }
    }
  },
  {
    languageOptions: {
      parser: ts.parser,
      parserOptions: {
        // ...
        project: true,
        extraFileExtensions: ['.svelte'], // This is a required setting in `@typescript-eslint/parser` v4.24.0.
      },
    },
  },
  {
    files: ['**/*.svelte', '*.svelte'],
    languageOptions: {
      parser: svelteParser,
      // Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
      parserOptions: {
        parser: ts.parser,
      },
    },
  },
  {
    rules: {
      // Allow explicit any, to avoid type gymnastics
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        caughtErrors: 'none',
      }],
      // Disallow floating promises to avoid random crashes
      '@typescript-eslint/no-floating-promises': 'error',
      // Single quotes where possible
      quotes: ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': false }],
      // Allow some `any` expressions since otherwise they seriously mess with tests, or enforce
      // strictness in areas where it really doesn't matter (eg error handling)
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      // Also disable template expression checks, since they're also error handling stuff
      // TODO: Enable them at some point when I get around to actually tidying things up
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      // FIXME: When I get around to hardening the request body validation, enable this rule again
      '@typescript-eslint/no-unsafe-member-access': 'off',
      // Allow empty functions, as they are useful to silence promise errors
      '@typescript-eslint/no-empty-function': 'off',
      // Use `type` instead of `interface`
      "@typescript-eslint/consistent-type-definitions": ["error", 'type'],
      // This error is already picked up by TypeScript, and it's annoying to need to silence it
      // twice when it is incorrect
      "@typescript-eslint/no-unsafe-call": "off",
      // Prevent node standard library imports without `node:` prefix
      "no-restricted-imports": ["error", {
        paths: [
          { name: "os", message: "Import from `node:os`" },
          { name: "path", message: "Import from `node:path`" },
          { name: "fs", message: "Import from `node:fs`" },
          { name: "fs/promises", message: "Import from `node:fs/promises`" },
          { name: "svelte/legacy", message: "Avoid legacy Svelte features" },
        ]
      }],
    },
  },
  {
    ignores: [
      '**/.DS_Store',
      '**/node_modules',
      'build',
      '.svelte-kit',
      'package',
      '**/.env',
      '**/.env.*',
      '!**/.env.example',
      '**/pnpm-lock.yaml',
      '**/package-lock.json',
      '**/yarn.lock',
      '**/svelte.config.js',
      '**/vitest.config.ts',
      'eslint.config.mjs',
      'vite.config.ts',
    ],
  },
);
