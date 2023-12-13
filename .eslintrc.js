// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  rules: {
    // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-undef': 'off',
    'no-useless-escape': 'off',
    'no-unreachable': 'off',
    'no-extra-semi': 'off',
    'no-irregular-whitespace': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
