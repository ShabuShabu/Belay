module.exports = {
  presets: [
    [
      '@babel/preset-env', {
        targets: {
          esmodules: true
        }
      }
    ]
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-throw-expressions', { loose: true }],
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-private-methods'
  ]
}
