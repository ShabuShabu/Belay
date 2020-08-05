export default class Exception {
  static axiosNotPresent () {
    return new Error('You must set Axios on the base model')
  }

  static typeMapNotPresent () {
    return new Error('You must set a type map on the base model')
  }

  static invalidResource (model) {
    return new Error(`[${this.name(model)}] Invalid resource was passed`)
  }

  static forbiddenAttribute (model, key) {
    return new Error(`[${this.name(model)}] Attribute [${key}] is not allowed`)
  }

  static forbiddenRelationship (model, key) {
    return new Error(`[${this.name(model)}] Relationship [${key}] is not allowed`)
  }

  static modelMappingMissing (model, type) {
    return new Error(`${this.name(model)}] No model mapping exists for [${type}]`)
  }

  static jsonApiTypeNotSet (model) {
    return new Error(`Property JSON:API type is not set for model [${this.name(model)}]`)
  }

  static propertyDefaultsNotSet (model) {
    return new Error(`Property defaults are not set for model [${this.name(model)}]`)
  }

  static cannotDeleteModel (model) {
    return new Error(`The [${this.name(model)}] model is new and cannot be deleted`)
  }

  static cannotCreateModel (model) {
    return new Error(`The [${this.name(model)}] model is not new and cannot be created`)
  }

  static cannotUpdateModel (model) {
    return new Error(`The [${this.name(model)}] model is new and cannot be updated`)
  }

  static name (model) {
    return model.constructor.name
  }
}
