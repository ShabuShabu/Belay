import DateCast from '../../lib/orm/casts/DateCast'
import schema from '../schemas/trip'
import { Model, User, Stream } from './Hierarchies'

export class Trip extends Model {
  /**
   * Instantiate a new model
   * @param resource
   */
  constructor (resource) {
    super(resource, schema)
  }

  static jsonApiType () {
    return 'trips'
  }

  get attributes () {
    return {
      name: '',
      description: '',
      faq: [],
      publishedAt: null,
      startedAt: null,
      finishedAt: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null
    }
  }

  get casts () {
    return {
      publishedAt: new DateCast(),
      startedAt: new DateCast(),
      finishedAt: new DateCast(),
      createdAt: new DateCast(),
      updatedAt: new DateCast(),
      deletedAt: new DateCast()
    }
  }

  get relationships () {
    return {
      user: this.hasOne(User, 'user').readOnly(),
      stream: this.hasMany(Stream, 'stream').readOnly()
    }
  }
}

export default Trip
