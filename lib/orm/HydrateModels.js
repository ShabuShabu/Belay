import { Model } from './Model'

function mapPropsModels () {
  return Object.keys(this.$data).reduce((props, key) => {
    if (!key.endsWith('Model')) {
      return
    }

    const name = key.replace('Model', '')

    props[name] = {
      get () {
        return this[key] instanceof Model ? this[key] : Model.hydrate(this[key])
      },

      set (value) {
        // handle the updates on the model ?
        // probs not possible with an object
      }
    }

    return props
  }, {})
}

export default {
  computed: {
    ...mapPropsModels()
  }
}
