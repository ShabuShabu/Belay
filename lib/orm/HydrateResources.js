import { Model } from './Model'

function mapPropsModels () {
  return Object.keys(this.$data).reduce((props, key) => {
    if (key.endsWith('Model')) {
      props[key.replace('Model', '')] = function () {
        return this[key] instanceof Model ? this[key] : Model.hydrate(this[key])
      }
    }

    if (key.endsWith('Collection')) {
      props[key.replace('Collection', '')] = function () {

      }
    }

    if (key.endsWith('Paginator')) {
      props[key.replace('Paginator', '')] = function () {

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
