import set from 'lodash/set'

export class Relation {
  /**
   * Instantiate a relationship
   * @param parent
   * @param child
   * @param key
   */
  constructor (parent, child, key) {
    this.parent = parent
    this.child = child
    this.readonly = false
    this.key = key
  }

  /**
   * Make the relationship read only
   * @returns {Relation}
   */
  readOnly () {
    this.readonly = true
    return this
  }

  /**
   * Get a model from the includes
   * @param id
   * @returns {*}
   */
  findInclude (id) {
    return this.parent.included.first(include => include.id === id)
  }

  /**
   * Get the relation data from a model
   * @param model
   * @returns {{id: *, type: *}}
   */
  relationFromModel (model) {
    return {
      type: model.type,
      id: model.id
    }
  }

  /**
   * Ensure only a valid model can be attached
   * @param model
   */
  guardAgainstInvalidRelation (model) {
    if (!(model instanceof this.child)) {
      throw new TypeError(`[${model?.constructor?.name ?? 'Unknown'}] is not an instance of [${this.child.constructor.name}]`)
    }
  }

  /**
   * Add a new relationship value
   * @param value
   * @returns {Relation}
   */
  setRelation (value) {
    set(this.parent.resource, `data.relationships.${this.key}`, value)

    return this
  }

  /**
   * Get the uri for the relationship
   * @returns {string}
   */
  get uri () {
    return `${this.parent.type}/${this.parent.id}/${this.child.jsonApiType()}`
  }
}

export default Relation
