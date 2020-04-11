import Vue from 'vue'
import EventBus from '../../src/EventBus'
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

  Model.autoSaveRelationships(autoSave)
  Model.setAxios(axios)
  Model.setTypeMap(modelTypeMap)

  if (eventBus) {
    Model.setEventBus(new EventBus(new Vue()))
  }

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
