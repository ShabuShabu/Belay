import isFunction from 'lodash/isFunction'
import { Model, Response } from './Hierarchies'
import EventBus from './EventBus'
import Module from './Module'

export const belay = (Vue, http, store, typeMap) => {
  http.onResponse(data => new Response(data))

  store.$events = new Vue()
  store.registerModule('models', Module, { preserveState: process.client })

  Model.setConfig({
    store,
    http,
    events: new EventBus(store.$events),
    typeMap: isFunction(typeMap) ? typeMap() : typeMap
  })
}
