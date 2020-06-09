const { resolve, join } = require('path')
const get = require('lodash/get')

module.exports = function (moduleOptions) {
  const defaults = {
    namespace: 'belay',
    autoSaveRelationships: true,
    typeMap: {}
  }

  const options = {
    ...defaults,
    ...moduleOptions,
    ...get(this.options, 'belay', {})
  }

  this.addPlugin({
    src: resolve(__dirname, 'plugin.js'),
    fileName: join(options.namespace, 'plugin.js'),
    options
  })
}

module.exports.meta = require('../package.json')
