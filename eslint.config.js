import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'
import globals from 'eslint-globals'
import svelte from 'eslint-plugin-svelte'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import svelteParser from 'svelte-eslint-parser'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svelteRecommended = svelte.configs?.['flat/recommended'] ?? svelte.configs?.recommended

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{ts}'],
    languageOptions: {
      ...globals.browser,
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json', './tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      ...globals.browser,
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.svelte'],
        project: ['./tsconfig.json', './tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      svelte,
    },
    rules: {
      ...(svelteRecommended?.rules ?? {}),
    },
  },
  {
    ignores: ['build/', '.svelte-kit/', 'dist/', 'node_modules/'],
  },
  prettier,
]
