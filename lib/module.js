const { resolve } = require('path')
const get = require('lodash/get')
const StoreModule = require('./dist/StoreModule')
const DateCast = require('./dist/casts/DateCast')
const { mapResourceProps } = require('./dist/helpers')
const { Collection, collect } = require('./dist/Collection')
const CollectionCast = require('./dist/casts/CollectionCast')
const { Model, Response, Paginator } = require('./dist/Hierarchies')

module.exports = function (moduleOptions) {
  const defaults = {
    useStore: true,
    namespace: 'belay',
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
module.exports.collect = collect
module.exports.Response = Response
module.exports.Paginator = Paginator
module.exports.Collection = Collection
module.exports.DateCast = DateCast.default
module.exports.StoreModule = StoreModule.default
module.exports.mapResourceProps = mapResourceProps
module.exports.CollectionCast = CollectionCast.default
module.exports.meta = require('../package.json')
