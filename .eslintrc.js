module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true,
  },
  rules: {
    // Customize rules here
    'no-console': 'off', // Allow console for this CLI application
    '@typescript-eslint/no-explicit-any': 'off', // Allow 'any' type when needed
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Don't require explicit return types
    '@typescript-eslint/no-unused-vars': ['error', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_' 
    }], // Allow unused vars that start with underscore
    'no-case-declarations': 'off', // Allow declarations in case blocks
    'no-useless-escape': 'warn', // Downgrade useless escape to warning
    '@typescript-eslint/no-var-requires': 'warn', // Downgrade requires to warning
    '@typescript-eslint/ban-ts-comment': ['warn', {
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': 'allow-with-description',
    }], // Allow ts-ignore with description
  },
};