const tseslint = require('typescript-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: ['dist/', 'jest.config.js', 'eslint.config.js'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        // Auto-resolves the nearest tsconfig per file
        // (tsconfig.json for lib, test/tsconfig.json for tests),
        // enabling the type-aware rules below.
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // ESLint 9 changed the default for caught errors from 'none' to 'all';
      // restore prior behaviour so intentionally-ignored catch bindings are allowed.
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/unbound-method': 'error',
    },
  },
  eslintConfigPrettier,
);
