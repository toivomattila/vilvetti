import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import convexPlugin from '@convex-dev/eslint-plugin'
import unusedImports from 'eslint-plugin-unused-imports'
import { defineConfig, globalIgnores } from 'eslint/config'

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig([
  globalIgnores([
    'dist',
    'convex/_generated/**',
    '.agents/**',
    '.cursor/**',
    '.worktrees/**',
    'node_modules/**',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // Remove unused imports (fixable); keep @typescript-eslint/no-unused-vars for vars
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'off',
    },
  },
  {
    files: ['convex/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir,
        projectService: true,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'off',
    },
  },
  ...convexPlugin.configs.recommended,
  {
    files: ['src/components/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
