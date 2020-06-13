import { Collection as BaseCollection } from 'collect.js'
import { Model } from './Model'

export class Collection extends BaseCollection {
  static CLASS_NAME = 'Collection'

  /**
   * Recursively transform the instance to its JSON representation
   */
  toJSON () {
    return this.items.map(model => model.toJSON())
  }

  /**
   * Hydrate a collection
   * @param items
   */
  static hydrate (items) {
    return collect(
      items.map(item => Model.hydrate(item))
    )
  }
}

/**
 * Helper to make a new collection instance
 * @param items
 * @returns {Collection}
 */
export const collect = (items) => {
  return new Collection(items)
}

export default Collection
