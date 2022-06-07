const isDevelopment =
  process.env.NODE_ENV === 'test' || // jest
  process.env.NODE_ENV === 'cosmos' // cosmos

module.exports = {
  compact: false,
  presets: [
    '@babel/preset-env',
    [
      '@babel/preset-react',
      {
        development: isDevelopment,
        // Ship with 'classic' runtime for compatibility with React >=17, otherwise ESM module resolution differs
        // between versions (see https://github.com/facebook/react/issues/20235); develop with 'automatic' runtime for
        // ease of development, so that React does not need to be top-level imported everywhere.
        runtime: isDevelopment ? 'automatic' : 'classic',
      },
    ],
    ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    'macros',
    [
      'module-resolver',
      {
        root: ['src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    ],
  ],
}
