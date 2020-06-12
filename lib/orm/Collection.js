import { Collection as BaseCollection } from 'collect.js'

export class Collection extends BaseCollection {
  /**
   * Recursively transform the instance to its JSON representation
   */
  toJSON () {
    return super.toJson()
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
