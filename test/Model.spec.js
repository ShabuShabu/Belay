import get from 'lodash/get'
import set from 'lodash/set'
import cloneDeep from 'lodash/cloneDeep'
import { m } from './responses/responses'
import { testSetup } from './helpers/setup'
import { Media, Page, Category, Gear, HasOne, HasMany, User } from './helpers/Hierarchies'

describe('Model', () => {
  testSetup('fake')

  test('it builds a query string', () => {
    const model = Category
      .select('field1', 'field2')
      .whereIn('field3', ['some', 'thing'])
      .include('user')
      .append('likes')
      .where('title', 'Cool')
      .page(3)
      .limit(10)
      .orderBy('createdAt')

    const query = `?include=user&append=likes&fields[${model.type}]=field1,field2&filter[field3]=some,thing&filter[title]=Cool&sort=createdAt&page=3&limit=10`

    expect(model.queryBuilder().query()).toEqual(query)
  })

  const modelProvider = (usersOnly = false) => {
    const modelMap = {
      categories: [Category, true, false, ['title', 'something']],
      pages: [Page, true, true, ['title', 'something']],
      users: [User, false, true, ['name', 'something']]
    }

    let provider = Object.keys(modelMap).reduce((data, key) => {
      data.push([key, m[key], ...modelMap[key]])
      return data
    }, [])

    if (usersOnly) {
      provider = provider.filter(args => args[3] === true)
    }

    return cloneDeep(provider)
  }

  test.each(
    modelProvider()
  )('it populates a %s model correctly', (type, attributes, Entity, hasUser) => {
    const model = new Entity(attributes)

    expect(model.type).toEqual(type)
    expect(model.isNew).toEqual(false)
    expect(model.resource).toEqual({ data: attributes.data })

    expect(model.attribute('createdAt')).toBeInstanceOf(Date)
    expect(model.attribute('updatedAt')).toBeInstanceOf(Date)

    if (hasUser) {
      expect(model.included.count()).toEqual(1)
      expect(model.relationship('user')).toBeInstanceOf(HasOne)
      expect(model.user).toBeInstanceOf(User)
    }
  })

  test.each(
    modelProvider()
  )('it populates a fresh %s model correctly', (type, attributes, Entity, hasUser) => {
    const model = new Entity()

    expect(model.type).toEqual(type)
    expect(model.isNew).toEqual(true)
    expect(model.resource.data.relationships).toEqual({})
    expect(model.resource.data.attributes).toEqual(model.attributes)

    if (hasUser) {
      expect(model.included.count()).toEqual(0)
      expect(model.relationship('user')).toBeInstanceOf(HasOne)
      expect(model.user).toBeNull()
    }
  })

  test.each(
    modelProvider()
  )('it populates a fresh %s model correctly with defaults', (type, attributes, Entity, u, t, [key, value]) => {
    const model = new Entity({
      [key]: value
    })

    expect(model.type).toEqual(type)
    expect(model.isNew).toEqual(true)
    expect(model.resource.data.relationships).toEqual({})
    expect(model.attribute(key)).toEqual(value)
  })

  test.each(
    modelProvider()
  )('it sets the trashed flag for the %s model correctly', (type, attributes, Entity, u, canBeTrashed) => {
    if (canBeTrashed) {
      set(attributes, 'data.attributes.deletedAt', '2020-04-01T21:05:24+02:00')
    }

    const model = new Entity(attributes)

    if (canBeTrashed) {
      expect(model.isTrashed()).toEqual(true)
      expect(model.attribute('deletedAt')).toBeInstanceOf(Date)
    } else {
      expect(model.isTrashed()).toEqual(false)
    }
  })

  test.each(
    modelProvider()
  )('it ensures attributes can be set and removed for a %s model', (type, attributes, Entity, u, t, [key, value]) => {
    const model = new Entity(attributes)

    model.attribute(key, value)

    expect(model.attribute(key)).toEqual(value)

    model.attribute(key, null)

    expect(model.resource.data.attributes[key]).toBeUndefined()
  })

  test.each(
    modelProvider()
  )('it ensures proxied attributes can be set and removed for a %s model', (type, attributes, Entity, u, t, [key, value]) => {
    const model = new Entity(attributes)

    model[key] = value

    expect(model.attribute(key)).toEqual(value)
    expect(model.resource.data.attributes[key]).toEqual(value)

    model[key] = null

    expect(model.resource.data.attributes[key]).toBeUndefined()
  })

  test.each(
    modelProvider()
  )('it sets the dirty flag for the %s model correctly', (type, attributes, Entity, u, t, [key, value]) => {
    const model = new Entity(attributes)

    model.attribute(key, value)

    expect(model.attribute(key)).toEqual(value)
    expect(model.isDirty()).toEqual(true)
  })

  test.each(
    modelProvider(true)
  )('it ensures a has-one relationship can be removed and set for a %s model', (type, attributes, Entity) => {
    const model = new Entity(attributes)

    expect(model.user).toBeInstanceOf(User)

    model.relationship('user', null)

    expect(model.user).toBeNull()

    model.relationship('user', new User(m.users))

    expect(model.user).toBeInstanceOf(User)
    expect(model.user.id).toEqual(m.users.data.id)
  })

  test.each(
    modelProvider(true)
  )('it ensures a proxied has-one relationship can be removed and set for a %s model', (type, attributes, Entity) => {
    const model = new Entity(attributes)

    expect(model.user).toBeInstanceOf(User)

    model.user = null

    expect(model.user).toBeNull()
    expect(model.relationships.user.resolve()).toBeNull()

    model.user = new User(m.users)

    expect(model.user).toBeInstanceOf(User)
    expect(model.relationships.user.resolve()).toBeInstanceOf(User)

    expect(model.user.id).toEqual(m.users.data.id)
  })

  test('it ensures toJsonApi() filtering works', () => {
    const user = new User(m.users)

    expect(user.localAttributes).toEqual([
      'links',
      'attributes.createdAt',
      'attributes.updatedAt',
      'attributes.deletedAt'
    ])

    user.localAttributes.forEach((path) => {
      expect(get(user.resource.data, path)).not.toBeUndefined()
    })

    const filtered = user.toJsonApi()

    user.localAttributes.forEach((path) => {
      expect(get(filtered.data, path)).toBeUndefined()
    })
  })

  test.each(
    modelProvider()
  )('it ensures a %s model can be serialized via JSON.stringify', (type, attributes, Entity) => {
    const entity = new Entity(attributes)

    expect(JSON.stringify(entity)).toEqual(JSON.stringify(entity.toJSON()))
  })

  test.each(
    modelProvider()
  )('it can remove attributes using the delete keyword for a %s model', (type, attributes, Entity) => {
    const entity = new Entity(attributes)

    expect(entity.createdAt).toBeInstanceOf(Date)

    delete entity.createdAt

    expect(entity.createdAt).toBeNull()
  })

  test.each(
    modelProvider(true)
  )('it can remove relationships using the delete keyword for a %s model', (type, attributes, Entity) => {
    const entity = new Entity(attributes)

    expect(entity.user).toBeInstanceOf(User)

    delete entity.user

    expect(entity.user).toBeNull()
  })

  test.each(
    modelProvider(true)
  )('it can check for the existence of an attribute or relationship using the in operator', (type, attributes, Entity) => {
    const entity = new Entity(attributes)

    expect('createdAt' in entity).toEqual(true)
    expect('user' in entity).toEqual(true)

    expect('nonExistentProp' in entity).toEqual(false)
  })

  test('it can get, set and remove has-many relationships', () => {
    const page = new Page(m.pages)

    expect(page.relationship('media')).toBeInstanceOf(HasMany)

    expect(page.media.count()).toEqual(0)

    const media = new Media(m.media)

    page.attach('media', media)

    expect(page.media.count()).toEqual(1)

    page.detach('media', media)

    expect(page.media.count()).toEqual(0)
  })

  test('it can attach and detach has-many relationships', () => {
    const page = new Page(m.pages)

    expect(page.media.count()).toEqual(0)

    const media = new Media(m.media)

    page.attachMedia(media)

    expect(page.media.count()).toEqual(1)

    page.detachMedia(media)

    expect(page.media.count()).toEqual(0)
  })

  test('it can attach and detach has-one relationships', () => {
    const gear = new Gear(m.gear)

    expect(gear.category).toBeNull()

    const category = new Category(m.categories)

    gear.attachCategory(category)

    expect(gear.category.id).toEqual(category.id)

    gear.detachCategory(category)

    expect(gear.category).toBeNull()
  })
})
