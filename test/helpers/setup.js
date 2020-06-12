import Emitter from 'tiny-emitter/dist/tinyemitter'
import { Model, Response, Category, Gear, Media, Page, Stream, Trip, User } from './Hierarchies'

export const testSetup = (axios, eventBus = true, autoSave = false) => {
  if (axios !== 'fake') {
    axios.defaults.baseURL = 'http://localhost'
    // noinspection JSCheckFunctionSignatures
    axios.interceptors.response.use(
      data => new Response(data),
      error => Promise.reject(error)
    )
  }

  const config = {
    autoSaveRelationships: autoSave,
    http: axios,
    typeMap: modelTypeMap()
  }

  if (eventBus) {
    config.events = new Emitter()
  }

  Model.setConfig(config)

  return axios
}

export const modelTypeMap = () => ({
  categories: Category,
  gear: Gear,
  media: Media,
  pages: Page,
  stream: Stream,
  trips: Trip,
  users: User
})
