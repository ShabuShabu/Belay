import { Model } from './Model'
import { Collection } from './Collection'
import { Paginator } from './Paginator'

export const mapResourceProps = (resources) => {
 return Object.keys(resources).reduce((props, key) => {
    const obj = resources[key]

    if (obj === Model) {
      props[key] = function () {
        return this[key] instanceof Model ? this[key] : Model.hydrate(this[key])
      }
    }

    if (obj === Collection) {
      props[key] = function () {
        return this[key] instanceof Model ? this[key] : Collection.hydrate(this[key])
      }
    }

    if (obj === Paginator) {
      props[key] = function () {
        return this[key] instanceof Model ? this[key] : new Paginator(this[key])
      }
    }

    return props
  }, {})
}
