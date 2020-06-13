import { Model } from './Model'
import { Collection } from './Collection'
import { Paginator } from './Paginator'

export function mapResourceProps (resources) {
  return Object.keys(resources).reduce((props, key) => {
    if (!resources[key].CLASS_NAME) {
      return props
    }

    const map = [
      [Model, value => Model.hydrate(value)],
      [Collection, value => Collection.hydrate(value)],
      [Paginator, value => new Paginator(value)]
    ]

    const entry = map.find(([Resource]) => Resource.CLASS_NAME === resources[key].CLASS_NAME)

    if (entry) {
      const [Resource, callback] = entry

      props[`${key}${Resource.CLASS_NAME}`] = function () {
        return this[key] instanceof Resource ? this[key] : callback(this[key])
      }
    }

    return props
  }, {})
}
