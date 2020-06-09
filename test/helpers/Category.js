import schema from '../schemas/category'
import DateCast from '../../lib/casts/DateCast'
import { Model, Gear, User, Stream, Page } from './Hierarchies'

export class Category extends Model {
  constructor (resource) {
    super(resource, schema)
  }

  static jsonApiType () {
    return 'categories'
  }

  get attributes () {
    return {
      title: '',
      createdAt: null,
      updatedAt: null
    }
  }

  get casts () {
    return {
      createdAt: new DateCast(),
      updatedAt: new DateCast()
    }
  }

  get relationships () {
    return {
      page: this.hasOne(Page, 'page'),
      user: this.hasOne(User, 'user').readOnly(),
      gear: this.hasMany(Gear, 'gear'),
      stream: this.hasMany(Stream, 'stream').readOnly()
    }
  }
}

export default Category
