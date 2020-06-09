import isFunction from 'lodash/isFunction'
import { Model, Response, Paginator } from './Hierarchies'
import Module from './Module'

/**
 * Helper to set Belay up properly
 * @param http
 * @param typeMap
 * @param store
 */
export const belay = (http, typeMap, store = null) => {
  http.onResponse(data => new Response(data))

  const config = {
    http,
    typeMap: isFunction(typeMap) ? typeMap() : typeMap
  }

  if (store) {
    config.store = store
    store.registerModule('belay', Module, { preserveState: process.client })
  }

  Model.setConfig(config)

  if (store) {
    belayVuexEvents()
  }
}

/**
 * Sets up all events to sync the models to Vuex
 */
export const belayVuexEvents = () => {
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
