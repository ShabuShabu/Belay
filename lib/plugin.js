import { StoreModule, Model, Response } from '@shabushabu/belay/lib'

const { namespace, autoSaveRelationships, typeMap } = JSON.parse('<%= JSON.stringify(options) %>')

export default ({ $axios: http, store }) => {
  http.onResponse(data => new Response(data))

  store.registerModule(namespace, StoreModule, {
    preserveState: Boolean(store.state[namespace])
  })

  Model.setConfig({
    store,
    http,
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
