import DateCast from '../../src/casts/DateCast'
import schema from '../schemas/user'
import { Model, Stream, Trip } from './Hierarchies'

export class User extends Model {
  constructor (resource) {
    super(resource, schema)
  }

  static jsonApiType () {
    return 'users'
  }

  get attributes () {
    return {
      name: '',
      email: null,
      variant: '',
      hasFullAccess: false,
      tiers: [0],
      settings: {},
      createdAt: null,
      updatedAt: null,
      deletedAt: null
    }
  }

  get casts () {
    return {
      createdAt: new DateCast(),
      updatedAt: new DateCast(),
      deletedAt: new DateCast()
    }
  }

  get relationships () {
    return {
      stream: this.hasMany(Stream, 'stream').readOnly(),
      trips: this.hasMany(Trip, 'trips').readOnly()
    }
  }
}

export default User
