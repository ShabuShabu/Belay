import Vue from 'vue'
import { StoreModule, Model, Response, HydrateResources } from '@shabushabu/belay'
import * as hierarchies from '<%= options.hierarchiesLocation %>'

const {
  useStore,
  namespace,
  useMixinGlobally,
  disableStoreEvents,
  autoSaveRelationships
} = JSON.parse('<%= JSON.stringify(options) %>')

if (useMixinGlobally) {
  Vue.mixin(HydrateResources)
}

export default ({ $axios, store }) => {
  $axios.onResponse(data => new Response(data))

  if (useStore) {
    store.registerModule(namespace, StoreModule, {
      preserveState: Boolean(store.state[namespace])
    })
  }

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
    store: useStore ? store : undefined,
    http: $axios,
    namespace,
    autoSaveRelationships,
    typeMap
  })

  if (useStore && !disableStoreEvents) {
    Model.on(
      [
        Model.SAVED,
        Model.TRASHED,
        Model.FETCHED,
        Model.RELATIONSHIP_SET,
        Model.RELATIONSHIP_REMOVED,
        Model.ATTRIBUTE_SET,
        Model.ATTRIBUTE_REMOVED
      ],
      ({ model }) => model.syncToStore()
    )

    Model.onDestroyed(({ model }) => model.removeFromStore())

    Model.onCollected(({ collection }) => {
      if (collection?.items !== undefined) {
        collection = collection.items
      }

      collection.each(model => model.syncToStore())
    })
  }
}
