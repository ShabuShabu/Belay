import categoriesModel from './models/categories'
import gearModel from './models/gear'
import mediaModel from './models/media'
import pagesModel from './models/pages'
import streamModel from './models/stream'
import tripsModel from './models/trips'
import usersModel from './models/users'
import categoriesCollection from './collections/categories'
import streamCollection from './collections/stream'

export const m = {
  categories: categoriesModel,
  gear: gearModel,
  media: mediaModel,
  pages: pagesModel,
  stream: streamModel,
  trips: tripsModel,
  users: usersModel
}

export const c = {
  categories: categoriesCollection,
  stream: streamCollection
}
