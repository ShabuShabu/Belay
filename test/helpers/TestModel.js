import Vue from 'vue'
import { Model } from './Hierarchies'
import { modelTypeMap } from './setup'

export class TestModel extends Model {
  static withAxios () {
    Model.$config.http = 'foo'
    return this
  }

  static withEvents () {
    Model.$config.events = new Vue()
    return this
  }

  static withTypeMap () {
    Model.$config.typeMap = modelTypeMap()
    return this
  }

  static withDefaults () {
    Object.defineProperty(TestModel.prototype, 'attributes', {
      configurable: true,
      get () {
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
    })

    return this
  }

  static withApiType () {
    TestModel.jsonApiType = () => {
      return 'users'
    }

    return this
  }

  static reset () {
    delete TestModel.jsonApiType
    delete TestModel.prototype.resource
    delete TestModel.prototype.attributes
    Model.$config = {}
    return this
  }
}

export default TestModel
