import Vue from 'vue'
import axios from 'axios'
import AxiosMock from 'axios-mock-adapter'
import EventBus from '../src/EventBus'
import { c, m } from './responses/responses'
import { Category, Model, Trip, Paginator, Page, Media, Response } from './helpers/Hierarchies'
import { testSetup } from './helpers/setup'

describe('Model Events', () => {
  let eventBus

  const mock = new AxiosMock(testSetup(axios, false))

  beforeEach(() => {
    eventBus = new Vue()
    Model.$config.events = new EventBus(eventBus)
    mock.reset()
  })

  const ensureNoOtherEventsFireExcept = (events) => {
    events = Array.isArray(events) ? events : [events]

    const allEvents = [
      Model.SAVED,
      Model.CREATED,
      Model.UPDATED,
      Model.TRASHED,
      Model.FETCHED,
      Model.ATTACHED,
      Model.DETACHED,
      Model.DESTROYED,
      Model.COLLECTED,
      Model.RELATIONS_SAVED
    ]

    allEvents.filter(
      event => !events.includes(event)
    ).forEach((event) => {
      eventBus.$on(event, () => {
        throw new Error(`Failure: event [${event}] fired `)
      })
    })
  }

  test('it ensures the SAVED and UPDATED events are fired when updating', async () => {
    const id = m.categories.data.id

    mock.onPut(`http://localhost/categories/${id}`).reply(204)

    const handler = ({ model, response }) => {
      expect(response).toBeInstanceOf(Response)
      expect(model).toBeInstanceOf(Category)
      expect(response.status).toEqual(204)
    }

    eventBus.$on(Model.SAVED, handler)
    eventBus.$on(Model.UPDATED, handler)

    ensureNoOtherEventsFireExcept([Model.SAVED, Model.UPDATED])

    const category = new Category(m.categories)
    await category.update()
  })

  test('it ensures the SAVED and UPDATE events are fired when creating', async () => {
    mock.onPost('http://localhost/categories').reply(201)

    const handler = ({ model, response }) => {
      expect(response).toBeInstanceOf(Response)
      expect(model).toBeInstanceOf(Category)
      expect(response.status).toEqual(201)
    }

    eventBus.$on(Model.SAVED, handler)
    eventBus.$on(Model.CREATED, handler)

    ensureNoOtherEventsFireExcept([Model.SAVED, Model.CREATED])

    const category = new Category()
    await category.create()
  })

  test('it ensures the DESTROYED event is fired', async () => {
    const id = m.categories.data.id

    mock.onDelete(`http://localhost/categories/${id}`).reply(204)

    eventBus.$on(Model.DESTROYED, ({ model, response }) => {
      expect(response).toBeInstanceOf(Response)
      expect(model).toBeInstanceOf(Category)
      expect(response.status).toEqual(204)
    })

    ensureNoOtherEventsFireExcept(Model.DESTROYED)

    const category = new Category(m.categories)
    await category.delete()
  })

  test('it ensures the TRASHED event is fired', async () => {
    const id = m.trips.data.id

    mock.onDelete(`http://localhost/trips/${id}`).reply(204)

    eventBus.$on(Model.TRASHED, ({ model, response }) => {
      expect(response).toBeInstanceOf(Response)
      expect(model).toBeInstanceOf(Trip)
      expect(response.status).toEqual(204)
    })

    ensureNoOtherEventsFireExcept(Model.TRASHED)

    const trip = new Trip(m.trips)
    await trip.delete()
  })

  test('it ensures the FETCHED event is fired', async () => {
    const id = m.categories.data.id

    mock.onGet(`http://localhost/categories/${id}`).reply(200, m.categories)

    eventBus.$on(Model.FETCHED, ({ model, response }) => {
      expect(response).toBeInstanceOf(Response)
      expect(model).toBeInstanceOf(Category)
      expect(model.id).toEqual(id)
      expect(response.status).toEqual(200)
    })

    ensureNoOtherEventsFireExcept(Model.FETCHED)

    await Category.find(id)
  })

  test('it ensures the COLLECTED event is fired', async () => {
    mock.onGet('http://localhost/categories').reply(200, c.categories)

    eventBus.$on(Model.COLLECTED, ({ collection, response }) => {
      expect(response).toBeInstanceOf(Response)
      expect(collection).toBeInstanceOf(Paginator)
      expect(response.status).toEqual(200)
    })

    ensureNoOtherEventsFireExcept(Model.COLLECTED)

    await Category.get()
  })

  test('it ensures the ATTACHED and DETACHED events are fired', () => {
    const page = new Page(m.pages)
    const media = new Media(m.media)

    eventBus.$on(Model.ATTACHED, ({ key, model, attached }) => {
      expect(key).toEqual('media')
      expect(model.id).toEqual(page.id)
      expect(media.id).toEqual(attached.id)
    })

    eventBus.$on(Model.DETACHED, ({ key, model, detached }) => {
      expect(key).toEqual('media')
      expect(model.id).toEqual(page.id)
      expect(media.id).toEqual(detached.id)
    })

    ensureNoOtherEventsFireExcept([Model.DETACHED, Model.ATTACHED])

    page.attach('media', media)
    page.detach('media', media)
  })

  test('it ensures the RELATIONS_SAVED event is fired', async () => {
    const category = new Category(m.categories)
    const page = new Page(m.pages)

    mock.onPut(`http://localhost/pages/${page.id}`).reply(204)

    eventBus.$on(Model.RELATIONS_SAVED, ({ responses }) => {
      expect(responses.length).toEqual(1)
    })

    const handler = ({ model }) => {
      expect(model).toBeInstanceOf(Page)
      expect(model.id).toEqual(page.id)
    }

    eventBus.$on(Model.UPDATED, handler)
    eventBus.$on(Model.SAVED, handler)

    ensureNoOtherEventsFireExcept([
      Model.RELATIONS_SAVED, // we're mainly testing this event
      Model.ATTACHED, // fired when the page is attached to the category
      Model.UPDATED, // fired when the page was updated
      Model.SAVED // fired when the page was updated
    ])

    page.title = 'New Title'

    category.attach('page', page)

    await category.saveRelationships()
  })
})
