import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { twilightEslintConfig } from '@salla.sa/twilight-theme-engine/eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '.tanstack/**',
      '.wrangler/**',
      'app/routeTree.gen.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx,js,cjs,mjs}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      // Review rule: never render merchant text as HTML.
      'react/no-danger': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message:
            'Salla review rejects themes that render setting text as HTML. Render text as text.',
        },
      ],
    },
  },
  // Salla's own rules: narrow imports, no window.location / document.query*.
  ...twilightEslintConfig,
  {
    // Node-side scripts and configs may touch the file system and process.
    files: ['scripts/**', '*.config.{js,cjs,ts}', 'app/styles/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    // Tests assert on rendered DOM, so they may query it.
    files: ['tests/**'],
    rules: { 'no-restricted-properties': 'off', 'no-restricted-globals': 'off' },
  },
  prettier
);
