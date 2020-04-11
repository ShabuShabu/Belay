import Ajv from 'ajv'
import jsonSchema from 'ajv/lib/refs/json-schema-draft-06.json'
import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'
import set from 'lodash/set'
import jsonApiSchema from './schemas/jsonapi'

export class Schema {
  constructor (schema = []) {
    this.schema = new Ajv().addMetaSchema(jsonSchema)
    this.schemata = Array.isArray(schema) ? schema : [schema]
  }

  validate (resource) {
    return this.schema.validate(
      merge(Object.assign({}, jsonApiSchema), ...this.schemata),
      resource
    )
  }

  isJsonApi (resource) {
    const schema = cloneDeep(jsonApiSchema)
    set(schema, 'definitions.attributes.additionalProperties', true)

    return this.schema.validate(schema, resource)
  }

  get errors () {
    return this.schema.errors
  }
}

export default Schema
