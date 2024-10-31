module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier'
  ],
  overrrides: [
    {
      files: ['src/renderer/src/components/**/*.ts'],
      rules: {
        'react/prop-types': 'off'
      }
    }
  ]
}
