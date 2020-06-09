import DateCast from '../../lib/casts/DateCast'
import schema from '../schemas/gear'
import { Model, User, Category } from './Hierarchies'

export class Gear extends Model {
  /**
   * Instantiate a new model
   * @param resource
   */
  constructor (resource) {
    super(resource, schema)
  }

  static jsonApiType () {
    return 'gear'
  }

  get attributes () {
    return {
      title: '',
      description: '',
      url: '',
      quantity: 0,
      cost: 0,
      weight: 0,
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
      user: this.hasOne(User, 'user').readOnly(),
      category: this.hasOne(Category, 'category')
    }
  }
}

export default Gear
