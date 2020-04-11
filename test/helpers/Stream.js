import isEmpty from 'lodash/isEmpty'
import DateCast from '../../src/casts/DateCast'
import streamSchema from '../schemas/stream'
import { Book, Model, Movie, Ride, User, Media, Trip } from './Hierarchies'

export class Stream extends Model {
  constructor (resource, schema = {}) {
    super(resource, [streamSchema, schema].filter(s => !isEmpty(s)))
  }

  static jsonApiType () {
    return 'stream'
  }

  get attributes () {
    return {
      title: '',
      content: '',
      variant: '',
      extras: {},
      continents: [],
      countries: [],
      cities: [],
      timezones: [],
      what3words: [],
      supporterTier: 0,
      happenedAt: null,
      publishedAt: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null
    }
  }

  get casts () {
    return {
      happenedAt: new DateCast(),
      publishedAt: new DateCast(),
      createdAt: new DateCast(),
      updatedAt: new DateCast(),
      deletedAt: new DateCast()
    }
  }

  static subTypeField () {
    return 'data.attributes.variant'
  }

  static children () {
    return {
      book: Book,
      movie: Movie,
      ride: Ride
    }
  }

  get relationships () {
    return {
      trip: this.hasOne(Trip, 'trip').readOnly(),
      user: this.hasOne(User, 'user').readOnly(),
      media: this.hasMany(Media, 'media')
    }
  }
}

export default Stream
