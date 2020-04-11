import axios from 'axios'
import AxiosMock from 'axios-mock-adapter'
import { m } from './responses/responses'
import { testSetup } from './helpers/setup'
import { Page, Gear, Book, User, Category } from './helpers/Hierarchies'

describe('Model Relationships', () => {
  const mock = new AxiosMock(testSetup(axios))

  beforeEach(() => {
    mock.reset()
  })

  test('it ensures any new or dirty relationships will be saved', async () => {
    const category = new Category(m.categories)

    const page = new Page(m.pages)
    const book = new Book(m.stream)
    const backpack = new Gear(m.gear)
    const tent = new Gear({
      title: 'A-Frame Tent',
      description: 'Made of sil-nylon'
    })

    mock.onPut(`http://localhost/pages/${page.id}`).reply((config) => {
      expect(page.resource.data.attributes.title).toEqual('New Title')
      expect(config.data).toEqual(JSON.stringify(page))

      return [204, {}]
    })

    mock.onPost('http://localhost/gear').reply((config) => {
      expect(config.data).toEqual(JSON.stringify(tent))

      return [201, {}]
    })

    mock.onPut(`http://localhost/users/${category.user.id}`).reply(() => {
      throw new Error('User is readonly and should not be updated')
    })

    mock.onPut(`http://localhost/gear/${backpack.id}`).reply(() => {
      throw new Error('Backpack is clean and should not be updated')
    })

    page.title = 'New Title'

    category.attach('page', page)
    category.attach('stream', book)
    category.attach('gear', backpack)
    category.attach('gear', tent)

    // see if the relationship setup was successful
    expect(tent.isNew).toEqual(true)
    expect(page.isDirty()).toEqual(true)
    expect(backpack.isDirty()).toEqual(false)
    expect(category.user).toBeInstanceOf(User)
    expect(category.page.id).toEqual(page.id)
    expect(category.gear.count()).toEqual(2)
    expect(category.stream.count()).toEqual(1)
    expect(category.gear.first().id).toEqual(backpack.id)
    expect(category.gear.last().id).toEqual(tent.id)
    expect(category.stream.first().id).toEqual(book.id)

    await category.saveRelationships()
  })
})
