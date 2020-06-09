import get from 'lodash/get'
import set from 'lodash/set'
import unset from 'lodash/unset'
import collect from 'collect.js'
import { Model } from './Hierarchies'

export default {
  namespaced: true,

  state: () => ({
    cache: {}
  }),

  mutations: {
    sync (state, model) {
      set(state.cache, [model.type, model.id], model.toJSON())
    },

    remove (state, model) {
      unset(state.cache, [model.type, model.id])
    }
  },

  actions: {
    sync ({ commit }, model) {
      if (!(model instanceof Model)) {
        return
      }

      commit('sync', model)
    },

    remove ({ commit }, model) {
      if (!(model instanceof Model)) {
        return
      }

      commit('remove', model)
    }
  },

  getters: {
    collection: state => (type) => {
      const models = Object.values(
        get(state.cache, type, {})
      ).map(
        model => Model.hydrate(model)
      )

      return collect(models)
    },

    model: state => (id, type = null) => {
      let model

      if (type) {
        model = get(state.cache, [type, id])
      } else {
        const models = Object.keys(state.cache).reduce(
          (models, sub) => ({ ...models, ...get(state.cache, sub, {}) }), {}
        )

        model = get(models, id)
      }

      return Model.hydrate(model)
    }
  }
}
