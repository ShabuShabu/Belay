export default class Exception {
  static axiosNotPresent () {
    return new Error('You must set Axios on the base model')
  }

  static typeMapNotPresent () {
    return new Error('You must set a type map on the base model')
  }

  static busNotPresent () {
    return new Error('You must set an event bus on the base model')
  }

  static invalidResource () {
    return new Error('Invalid resource was passed')
  }

  static forbiddenAttribute (key) {
    return new Error(`Attribute [${key}] is not allowed`)
  }

  static forbiddenRelationship (key) {
    return new Error(`Relationship [${key}] is not allowed`)
  }

  static modelMappingMissing (type) {
    return new Error(`No model mapping exists for [${type}]`)
  }

  static jsonApiTypeNotSet (model) {
    return new Error(`Property JSON:API type is not set for model [${model.constructor.name}]`)
  }

  static propertyDefaultsNotSet (model) {
    return new Error(`Property defaults are not set for model [${model.constructor.name}]`)
  }

  static cannotDeleteModel (model) {
    return new Error(`The [${model.constructor.name}] model is new and cannot be deleted`)
  }

  static cannotCreateModel (model) {
    return new Error(`The [${model.constructor.name}] model is not new and cannot be created`)
  }

  static cannotUpdateModel (model) {
    return new Error(`The [${model.constructor.name}] model is new and cannot be updated`)
  }
}
