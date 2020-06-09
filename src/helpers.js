import isFunction from 'lodash/isFunction'
import { Model, Response, Paginator } from './Hierarchies'
import Module from './Module'

/**
 * Helper to set Belay up properly
 * @param Vue
 * @param http
 * @param store
 * @param typeMap
 */
export const belay = (Vue, http, store, typeMap) => {
  http.onResponse(data => new Response(data))

  store.registerModule('models', Module, { preserveState: process.client })

  Model.setConfig({
    store,
    http,
    typeMap: isFunction(typeMap) ? typeMap() : typeMap
  })

  belayVuexEvents()
}

/**
 * Sets up all events to sync the models to Vuex
 */
export const belayVuexEvents = () => {
  Model.on(Model.SAVED, ({model}) => model.syncToStore())
  Model.on(Model.TRASHED, ({model}) => model.syncToStore())
  Model.on(Model.FETCHED, ({model}) => model.syncToStore())
  Model.on(Model.DESTROYED, ({model}) => model.removeFromStore())

  Model.on(Model.COLLECTED, ({collection}) => {
    if (collection instanceof Paginator) {
      collection = collection.items
    }

    collection.each(model => model.syncToStore())
  })
}
