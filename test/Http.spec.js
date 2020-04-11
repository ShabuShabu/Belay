import axios from 'axios'
import AxiosMock from 'axios-mock-adapter'
import { m, c } from './responses/responses'
import { Category, Trip, Stream, Ride, Book, Movie, Paginator } from './helpers/Hierarchies'
import { testSetup } from './helpers/setup'

describe('Http', () => {
  const mock = new AxiosMock(testSetup(axios))

  beforeEach(() => {
    mock.reset()
  })

  test('it can fetch a collection of resources', async () => {
    mock.onGet('http://localhost/categories').reply(200, c.categories)

    const categories = await Category.get(true)

    expect(categories.count()).toBeGreaterThan(0)

    categories.each((category) => {
      expect(category).toBeInstanceOf(Category)
    })
  })

  test('it can fetch a collection of paginated resources', async () => {
    mock.onGet('http://localhost/categories').reply(200, c.categories)

    const categories = await Category.get()

    expect(categories).toBeInstanceOf(Paginator)
  })

  test('it can fetch a single model', async () => {
    const id = m.categories.data.id

    mock.onGet(`http://localhost/categories/${id}`).reply(200, m.categories)

    const category = await Category.find(id)

    expect(category).toBeInstanceOf(Category)
    expect(category.resource).toEqual({ data: m.categories.data })
  })

  test('it can create a model', async () => {
    const category = new Category()

    mock.onPost('http://localhost/categories').reply((config) => {
      expect(category.resource.data.attributes.title).toEqual('New Title')
      expect(config.data).toEqual(JSON.stringify(category))

      return [201, {}]
    })

    category.title = 'New Title'

    await category.create()
  })

  test('it can update a model', async () => {
    const id = m.categories.data.id
    const category = new Category(m.categories)

    mock.onPut(`http://localhost/categories/${id}`).reply((config) => {
      expect(category.resource.data.attributes.title).toEqual('New Title')
      expect(config.data).toEqual(JSON.stringify(category))

      return [204, {}]
    })

    category.title = 'New Title'

    await category.update()
  })

  test('it can delete a model', async () => {
    const id = m.categories.data.id

    mock.onDelete(`http://localhost/categories/${id}`).reply(204)

    expect(m.categories.data.attributes.deletedAt).toBeUndefined()

    const category = new Category(m.categories)
    await category.delete()

    expect(category.wasDestroyed).toEqual(true)
  })

  test('it sets the wasDestroyed flag correctly for trashed models', async () => {
    const id = m.trips.data.id

    mock.onDelete(`http://localhost/trips/${id}`).reply(204)

    expect(m.trips.data.attributes.deletedAt).toBeNull()

    const trip = new Trip(m.trips)
    await trip.delete()

    expect(trip.wasDestroyed).toEqual(false)
    expect(trip.deletedAt).toBeInstanceOf(Date)
  })

  test('it can create or update a new model', async () => {
    const category = new Category()

    mock.onPost('http://localhost/categories').reply((config) => {
      expect(category.resource.data.attributes.title).toEqual('New Title')
      expect(config.data).toEqual(JSON.stringify(category))

      return [201, {}]
    })

    category.title = 'New Title'

    await category.createOrUpdate()
  })

  test('it can create or update an existing model', async () => {
    const id = m.categories.data.id
    const category = new Category(m.categories)

    mock.onPut(`http://localhost/categories/${id}`).reply((config) => {
      expect(category.resource.data.attributes.title).toEqual('New Title')
      expect(config.data).toEqual(JSON.stringify(category))

      return [204, {}]
    })

    category.title = 'New Title'

    await category.createOrUpdate()
  })

  test('it will hydrate a stream collection depending on their variants', async () => {
    mock.onGet('http://localhost/stream').reply(200, c.stream)

    const stream = await Stream.get(true)

    expect(stream.count()).toEqual(9)

    const types = {
      book: Book,
      ride: Ride,
      movie: Movie
    }

    stream.each((stream) => {
      expect(stream).toBeInstanceOf(types[stream.variant])
    })
  })
})
