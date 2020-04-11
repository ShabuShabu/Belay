import Vue from 'vue'
import { Model } from './Hierarchies'
import { modelTypeMap } from './setup'

export class TestModel extends Model {
  static withAxios () {
    Model.$http = 'foo'
    return this
  }

  static withEvents () {
    Model.$events = new Vue()
    return this
  }

  static withTypeMap () {
    Model.$typeMap = modelTypeMap()
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
    Model.$http = undefined
    return this
  }
}

export default TestModel
