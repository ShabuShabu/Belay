import get from 'lodash/get'
import isFunction from 'lodash/isFunction'
import { Collection, collect } from './Collection'
import { Model, Schema } from './Hierarchies'

export class Paginator {
  static CLASS_NAME = 'Paginator'

  constructor (response) {
    if (!new Schema().isJsonApi(response)) {
      this.items = Collection.hydrate(get(response, 'items', {}))
      this.links = get(response, 'links', {})
      this.data = get(response, 'data', {})
    } else {
      this.items = Paginator.fromResponse(response)
      this.links = get(response, 'links', {})
      this.data = get(response, 'meta.pagination', {})
    }

    return new Proxy(this, {
      has (paginator, key) {
        if (key in paginator.links || key in paginator.data) {
          return true
        }

        return Reflect.has(paginator, key)
      },

      get (paginator, key, receiver) {
        if (key in paginator.links) {
          return paginator.links[key]
        }

        if (key in paginator.data) {
          return paginator.data[key]
        }

        if (isFunction(paginator.items[key])) {
          return () => {
            return paginator.items[key](...arguments)
          }
        }

        return Reflect.get(paginator, key, receiver)
      }
    })
  }

  /**
   * Hydrate the response items
   * @param response
   * @returns {Collection<unknown>}
   */
  static fromResponse (response) {
    const models = response.data.map(
      model => Model.hydrate({
        data: model,
        includes: response.includes
      })
    )

    return collect(models)
  }

  /**
   * Recursively transform the instance to its JSON representation
   */
  toJSON () {
    return {
      items: this.items.toJSON(),
      links: this.links,
      data: this.data
    }
  }
}

export default Paginator
