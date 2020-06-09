import Module from '../Module'
import { Model, Response, Paginator } from '../Hierarchies'

const options = JSON.parse('<%= JSON.stringify(options) %>')

export default ({ $axios, store }) => {
  const namespace = options?.namespace ?? 'belay'

  $axios.onResponse(data => new Response(data))

  store.registerModule(namespace, Module, {
    preserveState: Boolean(store.state[namespace])
  })

  Model.setConfig({
    store,
    namespace,
    http: $axios,
    autoSaveRelationships: options?.autoSaveRelationships ?? true,
    typeMap: options.typeMap
  })

  Model.on(Model.SAVED, ({ model }) => model.syncToStore())
  Model.on(Model.TRASHED, ({ model }) => model.syncToStore())
  Model.on(Model.FETCHED, ({ model }) => model.syncToStore())
  Model.on(Model.DESTROYED, ({ model }) => model.removeFromStore())

  Model.on(Model.COLLECTED, ({ collection }) => {
    if (collection instanceof Paginator) {
      collection = collection.items
    }

    collection.each(model => model.syncToStore())
  })
}
