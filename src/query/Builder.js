import isUndefined from 'lodash/isUndefined'
import isInteger from 'lodash/isInteger'
import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import isObjectLike from 'lodash/isObjectLike'
import { Parser } from '../Hierarchies'

export class Builder {
  constructor (model) {
    this.model = model
    this.includes = []
    this.appends = []
    this.sorts = []
    this.pageValue = null
    this.limitValue = null
    this.fields = {}
    this.filters = {}

    this.parser = new Parser(this)
  }

  query () {
    return this.parser.query()
  }

  include (...args) {
    this.includes = args
    return this
  }

  append (...args) {
    this.appends = args
    return this
  }

  select (...fields) {
    if (fields.length === 0) {
      throw new Error('You must specify the fields on [select] method.')
    }

    if (isString(fields[0]) || Array.isArray(fields[0])) {
      this.fields[this.model.type] = fields.join(',')
    }

    if (isObject(fields[0])) {
      Object.entries(fields[0]).forEach(([key, value]) => {
        this.fields[key] = value.join(',')
      })
    }

    return this
  }

  where (key, value) {
    if (isUndefined(key) || isUndefined(value)) {
      throw new Error('The KEY and VALUE are required on [where] method.')
    }

    if (isObjectLike(value)) {
      throw new Error('The VALUE must be primitive on [where] method.')
    }

    this.filters[key] = value

    return this
  }

  whereIn (key, fields) {
    if (!Array.isArray(fields)) {
      throw new TypeError(
        'The second argument on [whereIn] method must be an array.'
      )
    }

    this.filters[key] = fields.join(',')

    return this
  }

  orderBy (...args) {
    this.sorts = args
    return this
  }

  page (value) {
    if (!isInteger(value)) {
      throw new TypeError('The VALUE must be an integer on [page] method.')
    }

    this.pageValue = value

    return this
  }

  limit (value) {
    if (!isInteger(value)) {
      throw new TypeError('The VALUE must be an integer on [limit] method.')
    }

    this.limitValue = value

    return this
  }
}

export default Builder
