import DateCast from '../../src/casts/DateCast'
import schema from '../schemas/page'
import { Model, Media, User } from './Hierarchies'

export class Page extends Model {
  /**
   * Instantiate a new model
   * @param resource
   */
  constructor (resource) {
    super(resource, schema)
  }

  static jsonApiType () {
    return 'pages'
  }

  get attributes () {
    return {
      title: '',
      slug: '',
      content: '',
      seo: {
        title: '',
        description: ''
      },
      publishedAt: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null
    }
  }

  get casts () {
    return {
      publishedAt: new DateCast(),
      createdAt: new DateCast(),
      updatedAt: new DateCast(),
      deletedAt: new DateCast()
    }
  }

  get relationships () {
    return {
      user: this.hasOne(User, 'user').readOnly(),
      media: this.hasMany(Media, 'media')
    }
  }
}

export default Page

/**
 * @name Page#attachMedia
 * @param {Media} media
 */
/**
 * @name Page#detachMedia
 * @param {Media} media
 */
