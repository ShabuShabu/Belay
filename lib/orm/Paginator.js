import get from 'lodash/get'
import isFunction from 'lodash/isFunction'
import { collect } from './Collection'
import { Model, Schema } from './Hierarchies'

export class Paginator {
  constructor (response) {
    if (!new Schema().isJsonApi(response)) {
      throw new Error('Invalid json:api response passed to paginator')
    }

    this.items = Paginator.hydrate(response)
    this.links = get(response, 'links', {})
    this.data = get(response, 'meta.pagination', {})

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
  static hydrate (response) {
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

  }
}

export default Paginator
