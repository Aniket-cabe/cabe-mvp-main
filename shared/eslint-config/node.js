module.exports = {
  extends: ['./index.js'],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    'no-console': 'warn',
    'no-process-exit': 'error',
  },
};
