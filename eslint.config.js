const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: ['angular-ui/', 'node_modules/']
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.commonjs,
        ...globals.jest
      }
    },
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-unused-vars': ['warn'],
      'no-console': 'off'
    }
  }
];
