import { StoreModule, Model, Response } from '@shabushabu/belay'
import * as hierarchies from '<%= options.hierarchiesLocation %>'

const { namespace, autoSaveRelationships } = JSON.parse('<%= JSON.stringify(options) %>')

export default ({ $axios, store }) => {
  $axios.onResponse(data => new Response(data))

  store.registerModule(namespace, StoreModule, {
    preserveState: Boolean(store.state[namespace])
  })

  const typeMap = Object.keys(hierarchies).reduce((map, name) => {
    const child = Object
      .values(hierarchies[name].children())
      .find(func => Object.is(func, hierarchies[name]))

    if (child) {
      return map
    }

    const type = hierarchies[name].jsonApiType()
    map[type] = hierarchies[name]

    return map
  }, {})

  Model.setConfig({
    store,
    http: $axios,
    namespace,
    autoSaveRelationships,
    typeMap
  })

  Model.on(Model.SAVED, ({ model }) => model.syncToStore())
  Model.on(Model.TRASHED, ({ model }) => model.syncToStore())
  Model.on(Model.FETCHED, ({ model }) => model.syncToStore())
  Model.on(Model.DESTROYED, ({ model }) => model.removeFromStore())

  Model.on(Model.COLLECTED, ({ collection }) => {
    if (collection?.items !== undefined) {
      collection = collection.items
    }

    collection.each(model => model.syncToStore())
  })
}
