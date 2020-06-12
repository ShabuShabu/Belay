import isFunction from 'lodash/isFunction'
import isObject from 'lodash/isObject'
import { collect } from '../Collection'

export default class CollectionCast {
  hydrate (value) {
    return Array.isArray(value) || isObject(value) ? collect(value) : value
  }

  dehydrate (value) {
    return isFunction(value?.all) ? value.all() : value
  }
}
