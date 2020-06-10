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
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-throw-expressions',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-private-methods'
  ]
}
