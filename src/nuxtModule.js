import { resolve, join } from 'path'

export default function nuxtModule (moduleOptions) {
  const options = {
    ...this.options.belay,
    ...moduleOptions
  }

  const namespace = options?.namespace ?? 'belay'

  this.addPlugin({
    src: resolve(__dirname, 'nuxt/plugin.js'),
    fileName: join(namespace, 'plugin.js'),
    options
  })
}

module.exports.meta = require('../package.json')
