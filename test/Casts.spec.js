import DateCast from '../src/casts/DateCast'
import CollectionCast from '../src/casts/CollectionCast'
import formatISO from 'date-fns/formatISO'
import parseISO from 'date-fns/parseISO'

describe('Casts', () => {
  const castProvider = () => {
    const castMap = {
      date: [DateCast, '2020-04-01T21:05:24+02:00'],
      collection: [CollectionCast, { test: 1 }]
    }

    return Object.keys(castMap).reduce((data, key) => {
      data.push([key, ...castMap[key]])
      return data
    }, [])
  }

  test.each(castProvider())('it hydrates and mutates %s values correctly', (type, Cast, value) => {
    const cast = new Cast()

    const hydrated = cast.hydrate(value)

    if (type === 'date') {
      expect(hydrated).toBeInstanceOf(Date)

      const original = new Date(value)
      const dehydrated = parseISO(cast.dehydrate(hydrated))

      expect(formatISO(dehydrated)).toEqual(formatISO(original))

    } else if (type === 'collection') {
      expect(hydrated.all()).toEqual(value)
      expect(cast.dehydrate(hydrated)).toEqual(value)
    }
  })

  test.each(castProvider())('it does not hydrate or mutate invalid values for a %s', (type, Cast) => {
    const cast = new Cast()
    const value = 1

    expect(cast.hydrate(value)).toEqual(value)
    expect(cast.dehydrate(value)).toEqual(value)
  })
})
