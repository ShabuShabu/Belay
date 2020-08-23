/* eslint-disable no-new */
import { c } from './responses/responses'
import { Paginator, Category } from './helpers/Hierarchies'
import { testSetup } from './helpers/setup'

describe('Paginator', () => {
  testSetup('fake')

  test('it gets populated from a valid response', () => {
    const paginator = new Paginator(c.categories)

    expect(paginator.links).toEqual(c.categories.links)
    expect(paginator.data).toEqual(c.categories.meta.pagination)
    expect(paginator.items.count()).toBeGreaterThan(0)

    paginator.items.each((category) => {
      expect(category).toBeInstanceOf(Category)
    })
  })

  test('it allows for links to be retrieved by proxy', () => {
    const paginator = new Paginator(c.categories)

    expect(paginator.next).toEqual(c.categories.links.next)
    expect(paginator.prev).toEqual(c.categories.links.prev)
    expect(paginator.first).toEqual(c.categories.links.first)
    expect(paginator.last).toEqual(c.categories.links.last)
  })

  test('it allows for pagination data to be retrieved by proxy', () => {
    const paginator = new Paginator(c.categories)

    expect(paginator.currentPage).toEqual(c.categories.meta.pagination.currentPage)
    expect(paginator.from).toEqual(c.categories.meta.pagination.from)
    expect(paginator.lastPage).toEqual(c.categories.meta.pagination.lastPage)
    expect(paginator.path).toEqual(c.categories.meta.pagination.path)
    expect(paginator.perPage).toEqual(c.categories.meta.pagination.perPage)
    expect(paginator.to).toEqual(c.categories.meta.pagination.to)
    expect(paginator.total).toEqual(c.categories.meta.pagination.total)
  })

  test('it proxies any methods to the underlying collection', () => {
    const paginator = new Paginator(c.categories)

    expect(paginator.count()).toEqual(paginator.items.count())
    expect(paginator.has('bla')).toEqual(false)
  })
})
