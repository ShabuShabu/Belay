import get from 'lodash/get'
import set from 'lodash/set'
import unset from 'lodash/unset'
import { collect } from './Collection'
import { Model } from './Model'

export default {
  namespaced: true,

  state: () => ({
    cache: {}
  }),

  mutations: {
    sync (state, model) {
      if (typeof model.toJSON === 'function') {
        set(state.cache, [model.type, model.id], model.toJSON())
      }
    },

    remove (state, model) {
      unset(state.cache, [model.type, model.id])
    }
  },

  actions: {
    sync ({ commit }, model) {
      commit('sync', model)
    },

    remove ({ commit }, model) {
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
        model = get(state.cache, [type, id], null)
      } else {
        const models = Object.keys(state.cache).reduce(
          (models, sub) => ({ ...models, ...get(state.cache, sub, {}) }), {}
        )

        model = get(models, id, null)
      }

      return model !== null ? Model.hydrate(model) : model
    }
  }
}
