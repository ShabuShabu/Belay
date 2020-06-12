import { Collection } from './Collection'
import { Model } from './Model'
import { Paginator } from './Paginator'

function mapPropsModels () {
  return Object.keys(this.$data).reduce((props, key) => {
    if (key.endsWith('Model')) {
      props[key.replace('Model', '')] = function () {
        return this[key] instanceof Model ? this[key] : Model.hydrate(this[key])
      }
    }

    if (key.endsWith('Collection')) {
      props[key.replace('Collection', '')] = function () {
        return this[key] instanceof Collection ? this[key] : Paginator.hydrate(this[key])
      }
    }

    if (key.endsWith('Paginator')) {
      props[key.replace('Paginator', '')] = function () {
        return this[key] instanceof Paginator ? this[key] : new Paginator(this[key])
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
