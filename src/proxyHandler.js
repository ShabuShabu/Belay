const isRelationshipOperation = (string, name) => {
  return string.startsWith(name) && string.length > name.length
}

const relationshipName = (string, name) => string.replace(name, '').toLowerCase()

export default {
  /**
   * Proxies checking for attributes and relationships
   * @param model
   * @param key
   * @returns {boolean}
   */
  has (model, key) {
    if (model.hasAttribute(key) || model.hasRelationship(key)) {
      return true
    }

    return Reflect.has(model, key)
  },

  /**
   * Proxies getting attributes and relationships
   * @param model
   * @param key
   * @param receiver
   * @returns {Collection<unknown>|Model|string|void|Q.Promise<any>|*|Array<Path>|Promise<void>|parser.Attribute}
   */
  get (model, key, receiver) {
    if (model.hasAttribute(key)) {
      return model.attribute(key)
    }

    if (model.hasRelationship(key)) {
      return model.relationship(key).resolve()
    }

    if (isRelationshipOperation(key, 'detach')) {
      return value => model.detach(relationshipName(key, 'detach'), value)
    }

    if (isRelationshipOperation(key, 'attach')) {
      return value => model.attach(relationshipName(key, 'attach'), value)
    }

    return Reflect.get(model, key, receiver)
  },

  /**
   * Proxies setting attributes and relationships
   * @param model
   * @param key
   * @param value
   * @param receiver
   * @returns {boolean}
   */
  set (model, key, value, receiver) {
    if (model.hasAttribute(key)) {
      model.attribute(key, value)
      return true
    }

    if (model.hasRelationship(key)) {
      model.relationship(key, value)
      return true
    }

    return Reflect.set(model, key, value, receiver)
  },

  /**
   * Proxies delete action for attributes and relationships
   * @param model
   * @param key
   * @returns {boolean}
   */
  deleteProperty (model, key) {
    if (model.hasAttribute(key)) {
      model.attribute(key, null)
      return true
    }

    if (model.hasRelationship(key)) {
      model.relationship(key, null)
      return true
    }

    return Reflect.deleteProperty(model, key)
  }
}
