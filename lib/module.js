const { resolve } = require('path')
const get = require('lodash/get')
const { Model, Response } = require('./dist/Hierarchies')
const StoreModule = require('./dist/StoreModule')
const HydrateResources = require('./dist/HydrateResources')
const DateCast = require('./dist/casts/DateCast')
const CollectionCast = require('./dist/casts/CollectionCast')

module.exports = function (moduleOptions) {
  const defaults = {
    useStore: true,
    namespace: 'belay',
    useMixinGlobally: false,
    disableStoreEvents: false,
    autoSaveRelationships: true,
    hierarchiesLocation: '~/models/Hierarchies'
  }

  const options = {
    ...defaults,
    ...moduleOptions,
    ...get(this.options, 'belay', {})
  }

  this.addPlugin({
    src: resolve(__dirname, 'plugin.js'),
    fileName: 'belay.js',
    options
  })
}

module.exports.Model = Model
module.exports.Response = Response
module.exports.DateCast = DateCast.default
module.exports.StoreModule = StoreModule.default
module.exports.HydrateResourcess = HydrateResources.default
module.exports.CollectionCast = CollectionCast.default
module.exports.meta = require('../package.json')
