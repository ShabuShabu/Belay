import DateCast from '../../lib/orm/casts/DateCast'
import schema from '../schemas/media'
import { Model, User } from './Hierarchies'

export class Media extends Model {
  /**
   * Instantiate a new model
   * @param resource
   */
  constructor (resource) {
    super(resource, schema)
  }

  static jsonApiType () {
    return 'media'
  }

  get attributes () {
    return {
      caption: '',
      mime: '',
      files: {},
      meta: {},
      takenAt: null,
      createdAt: null,
      updatedAt: null
    }
  }

  get casts () {
    return {
      takenAt: new DateCast(),
      createdAt: new DateCast(),
      updatedAt: new DateCast()
    }
  }

  get relationships () {
    return {
      user: this.hasOne(User, 'user').readOnly()
    }
  }
}

export default Media
