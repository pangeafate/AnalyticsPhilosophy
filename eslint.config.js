module.exports = [
    {
      files: ['**/*.{js,jsx}'],
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          }
        },
        globals: {
          window: 'readonly',
          document: 'readonly',
          console: 'readonly',
          process: 'readonly',
          global: 'readonly',
          describe: 'readonly',
          test: 'readonly',
          expect: 'readonly',
          beforeEach: 'readonly',
          jest: 'readonly',
          module: 'readonly',
          require: 'readonly',
          exports: 'readonly',
          __dirname: 'readonly'
        }
      },
      rules: {
        'no-unused-vars': 'warn',
        'no-console': 'off'
      }
    },
    {
      ignores: ['node_modules/**', 'coverage/**', 'dist/**']
    }
  ];