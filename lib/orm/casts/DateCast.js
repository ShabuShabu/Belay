import isString from 'lodash/isString'
import parseISO from 'date-fns/parseISO'
import formatISO from 'date-fns/formatISO'

export default class DateCast {
  hydrate (value) {
    if (!isString(value)) {
      return value
    }

    const date = parseISO(value)

    return date === 'Invalid Date' ? value : date
  }

  dehydrate (value) {
    if (!(value instanceof Date)) {
      return value
    }

    return formatISO(value)
  }
}
