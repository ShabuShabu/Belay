import has from 'lodash/has'
import set from 'lodash/set'
import get from 'lodash/get'
import unset from 'lodash/unset'
import merge from 'lodash/merge'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import isObject from 'lodash/isObject'
import trimStart from 'lodash/trimStart'
import cloneDeep from 'lodash/cloneDeep'
import Emitter from 'tiny-emitter/dist/tinyemitter'
import { v4 as uuid } from 'uuid'
import formatISO from 'date-fns/formatISO'
import { collect } from './Collection'
import { Builder, HasMany, HasOne, Response, Paginator, Schema } from './Hierarchies'
import proxyHandler from './proxyHandler'
import Exception from './Exception'

/**
 * The base model that all other models should extend
 */
export class Model {
  /**
   * All events fired by a model
   */
  static SAVED = 'saved'
  static CREATED = 'created'
  static UPDATED = 'updated'
  static TRASHED = 'trashed'
  static FETCHED = 'fetched'
  static ATTACHED = 'attached'
  static DETACHED = 'detached'
  static DESTROYED = 'destroyed'
  static COLLECTED = 'collected'
  static ATTRIBUTE_SET = 'attributeSet'
  static RELATIONS_SAVED = 'relationsSaved'
  static RELATIONSHIP_SET = 'relationshipSet'
  static ATTRIBUTE_REMOVED = 'attributeRemoved'
  static RELATIONSHIP_REMOVED = 'relationshipRemoved'

  #builder = null

  /**
   * Instantiate a new model
   * @param resource
   * @param schema
   */
  constructor (resource, schema) {
    this.#runSetupChecks()

    this.schema = new Schema(schema)

    if (resource === null) {
      this.#builder = new Builder(this)
    } else {
      return this.#setup(resource)
    }
  }

  /**
   * Run the setup routine
   * @param resource
   * @returns {Model}
   * @private
   */
  #setup (resource) {
    resource = cloneDeep(resource)

    this.isNew = true
    this.wasDestroyed = false
    this.included = this.#filterIncluded(resource)
    this.resource = this.#setData(resource)
    this.original = cloneDeep(this.resource)

    this.#guardAgainstInvalidSchema()

    /**
     * Here we run any setup for the instantiated class
     */
    this.constructor.boot()

    return new Proxy(this, proxyHandler)
  }

  /**
   * Perform a set of checks
   * @private
   */
  #runSetupChecks () {
    if (Model.$config.http === undefined) {
      throw Exception.axiosNotPresent()
    }

    if (Model.$config?.typeMap === undefined) {
      throw Exception.typeMapNotPresent()
    }

    if (this.constructor.jsonApiType() === '') {
      throw Exception.jsonApiTypeNotSet(this)
    }

    if (isEmpty(this.attributes)) {
      throw Exception.propertyDefaultsNotSet(this)
    }
  }

  /**
   * Guard against an invalid json schema
   * @private
   */
  #guardAgainstInvalidSchema () {
    if (!this.schema.validate(this.resource)) {
      throw Exception.invalidResource()
    }
  }

  /**
   * Sets the data on the resource or creates a default
   * @param resource
   * @returns {{data: *}}
   * @private
   */
  #setData (resource) {
    let data

    if (!this.schema.isJsonApi(resource)) {
      data = {
        id: this.newId(),
        type: this.constructor.jsonApiType(),
        attributes: this.#mergeDefaultAttributes(resource),
        relationships: {}
      }

      if (!data.id) {
        unset(data, 'id')
      }
    } else {
      data = resource?.data
      this.isNew = false
    }

    return { data }
  }

  /**
   *
   * @param resource
   * @returns {{}}
   * @private
   */
  #mergeDefaultAttributes (resource) {
    if (!isObject(resource)) {
      return this.attributes
    }

    return merge(
      Object.assign({}, this.attributes),
      collect(resource).only(Object.keys(this.attributes)).all()
    )
  }

  /**
   * Only include related models
   * @param resource
   * @returns {object}
   * @private
   */
  #filterIncluded (resource) {
    const ids = Object.values(resource?.data?.relationships ?? {}).reduce(
      (ids, relationship) => {
        if (Array.isArray(relationship.data)) {
          relationship.data.forEach(({ data: id }) => ids.push(id))
        } else {
          ids.push(relationship.data.id)
        }
        return ids
      },
      []
    )

    return collect(resource?.includes ?? [])
      .filter(
        ({ id }) => ids.includes(id)
      )
      .map(
        included => Model.hydrate(included)
      )
  }

  /**
   *
   */
  static boot () {
    // can be overridden to add events
  }

  /**
   * Gets the base entity for a given type
   * @param type
   * @returns {*}
   */
  static entityForType (type) {
    if (!has(Model.$config.typeMap, type)) {
      throw Exception.modelMappingMissing(type)
    }

    return Model.$config.typeMap[type]
  }

  /**
   * Hydrate a model with some resource data
   * @param resource
   * @returns {*}
   */
  static hydrate (resource) {
    if (!has(resource, 'data')) {
      resource = { data: resource }
    }

    const type = resource?.data?.type ?? null

    const Entity = this.entityForType(type)

    if (Entity.subTypeField() === null) {
      return new Entity(resource)
    }

    const subType = get(resource, Entity.subTypeField())
    const SubEntity = Entity.children()?.[subType] ?? Entity

    return new SubEntity(resource)
  }

  /**
   * Get all child models
   * @returns {object}
   */
  static children () {
    return {}
  }

  /**
   * Get all attributes that should be cast to an object
   * @returns {object}
   */
  get casts () {
    return {}
  }

  /**
   * Get the field holding the type to hydrate
   * @returns {string|null}
   */
  static subTypeField () {
    return null
  }

  /**
   * Get the model Axios instance
   * @returns {*}
   */
  get http () {
    return Model.$config.http
  }

  /**
   * Get the model Vuex instance
   * @returns {*}
   */
  get store () {
    return Model.$config.store
  }

  /**
   * Check if we use the store
   * @returns {boolean}
   */
  get usingStore () {
    return Model?.$config?.store !== undefined
  }

  /**
   * Sync the model to Vuex
   */
  syncToStore () {
    if (this.usingStore) {
      this.store.dispatch(`${Model.$config.namespace}/sync`, this)
    }
  }

  /**
   * Remove the model from Vuex
   */
  removeFromStore () {
    if (this.usingStore) {
      this.store.dispatch(`${Model.$config.namespace}/remove`, this)
    }
  }

  /**
   * Fire model events
   * @param event
   * @param payload
   * @returns {Model}
   * @private
   */
  #emit (event, payload = {}) {
    const events = Array.isArray(event) ? event : [event]

    events.forEach(
      name => {
        Model.$config.events.emit(name, payload)
        Model.$config.events.emit(`${this.type}.${name}`, payload)
      }
    )

    return this
  }

  /**
   * Add event handlers
   * @param event
   * @param handler
   */
  static on (event, handler) {
    const events = Array.isArray(event) ? event : [event]

    events.forEach(name => Model.$config.events.on(
      trimStart(`${this.jsonApiType()}.${name}`, '.'),
      handler
    ))
  }

  /**
   * Remove event handlers
   * @param event
   * @param handler
   */
  static off (event, handler = null) {
    const events = Array.isArray(event) ? event : [event]

    events.forEach(name => Model.$config.events.off(
      trimStart(`${this.jsonApiType()}.${name}`, '.'),
      handler
    ))
  }

  /**
   * The JSON:API type, must be overridden in a child class
   * @returns {string}
   */
  static jsonApiType () {
    return ''
  }

  /**
   * Holds all allowed model attributes and their default value
   * @returns {object}
   */
  get attributes () {
    return {}
  }

  /**
   * Gets the model ID
   * @returns {*}
   */
  get id () {
    return this.resource?.data?.id ?? null
  }

  /**
   * Sets the ID of the model, must be a UUID
   * @param id
   */
  set id (id) {
    this.isNew = true

    set(this.resource, 'data.id', id)
  }

  /**
   * Generate an id
   * @returns {string|null}
   */
  newId () {
    return uuid()
  }

  /**
   * Gets the base uri for http requests
   * @returns {string}
   */
  get baseUri () {
    return this.type
  }

  /**
   * Gets the model type
   * @returns {string}
   */
  get type () {
    return this.resource?.data?.type ?? this.constructor.jsonApiType()
  }

  /**
   * Flag that describes if the model data has been modified
   * @returns {boolean}
   */
  isDirty () {
    return !isEqual(this.original, this.resource)
  }

  /**
   * Get the attribute that decides if a model is trashed or not
   * @returns {*}
   * @private
   */
  get trashedAttribute () {
    return Model.$config?.trashedAttribute ?? 'deletedAt'
  }

  /**
   * Flag that describes if the model has been soft deleted
   * @returns {boolean}
   */
  isTrashed () {
    return this.attribute(this.trashedAttribute) instanceof Date
  }

  /**
   * Any attributes that are only for local consumption
   * @returns {*[]}
   */
  get localAttributes () {
    return [
      'links',
      'attributes.createdAt',
      'attributes.updatedAt',
      `attributes.${this.trashedAttribute}`
    ]
  }

  /**
   * Get the plain object representation of the object
   * @returns {{data: *}}
   */
  toJSON () {
    this.#guardAgainstInvalidSchema()

    return this.resource
  }

  /**
   * Get the JSON:API representation of the model
   * @returns {object}
   */
  toJsonApi () {
    this.#guardAgainstInvalidSchema()

    const resource = cloneDeep(this.resource)

    this.localAttributes
      .map(key => `data.${key}`)
      .forEach(path => unset(resource, path))

    return resource
  }

  /**
   * Check if an attribute exists
   * @param key
   * @returns {boolean|boolean}
   */
  hasAttribute (key) {
    return key in this.attributes
  }

  /**
   * Get a model attribute
   * @param key
   * @returns {*}
   * @private
   */
  #getAttribute (key) {
    const value = get(
      this.resource,
      `data.attributes.${key}`,
      get(this.attributes, key, null)
    )

    if (has(this.casts, key)) {
      return this.casts[key].hydrate(value)
    }

    return value
  }

  /**
   * Removes a model attribute
   * @param key
   * @returns {Model}
   * @private
   */
  #removeAttribute (key) {
    unset(this.resource, `data.attributes.${key}`)

    this.#emit(Model.ATTRIBUTE_REMOVED, { key, model: this })

    return this
  }

  /**
   * Sets a model attribute
   * @param key
   * @param value
   * @returns {Model}
   * @private
   */
  #setAttribute (key, value) {
    if (has(this.casts, key)) {
      value = this.casts[key].dehydrate(value)
    }

    set(this.resource, `data.attributes.${key}`, value)

    this.#emit(Model.ATTRIBUTE_REMOVED, { key, model: this })

    return this
  }

  /**
   * Gets, sets or removes a model attribute
   * @param key
   * @param value
   * @returns {Model|null}
   */
  attribute (key, value) {
    if (value === undefined) {
      return this.#getAttribute(key)
    }

    if (!this.hasAttribute(key)) {
      throw Exception.forbiddenAttribute(key)
    }

    if (value === null) {
      return this.#removeAttribute(key)
    }

    return this.#setAttribute(key, value)
  }

  /**
   * Get all allowed relationships for the model
   * @returns {{}}
   */
  get relationships () {
    return {}
  }

  /**
   * Denotes a relationship as hasMany
   * @param model
   * @param key
   * @returns {HasMany}
   */
  hasMany (model, key) {
    return new HasMany(this, model, key)
  }

  /**
   * Denotes a relationship as hasOne
   * @param model
   * @param key
   * @returns {HasOne}
   */
  hasOne (model, key) {
    return new HasOne(this, model, key)
  }

  /**
   * Check if an attribute exists
   * @param key
   * @returns {boolean|boolean}
   */
  hasRelationship (key) {
    return key in this.relationships
  }

  /**
   * Get a model relationship
   * @param key
   * @returns {null|Relation}
   * @private
   */
  #getRelationship (key) {
    const relation = this.relationships?.[key]

    return relation === undefined ? null : relation
  }

  /**
   * Remove a model relationship
   * @param key
   * @returns {Model}
   * @private
   */
  #removeRelationship (key) {
    unset(this.resource, `data.relationships.${key}`)

    this.#emit(Model.RELATIONSHIP_REMOVED, { key, model: this })

    return this
  }

  /**
   * Set a model relationship
   * @param key
   * @param model
   * @returns {Model}
   * @private
   */
  #setRelationship (key, model) {
    this.relationship(key).attach(model)

    if (!this.included.pluck('id').contains(model.id)) {
      this.included.push(model)
    }

    this.#emit(Model.RELATIONSHIP_SET, { key, model: this, attached: model })

    return this
  }

  /**
   * Gets, sets or removes a model relationship
   * @param key
   * @param value
   * @returns {Relation|this}
   */
  relationship (key, value) {
    if (value === undefined) {
      return this.#getRelationship(key)
    }

    if (!this.hasRelationship(key)) {
      throw Exception.forbiddenRelationship(key)
    }

    if (value === null) {
      return this.#removeRelationship(key)
    }

    return this.#setRelationship(key, value)
  }

  /**
   * Attach a model to a relationship
   * @param key
   * @param model
   */
  attach (key, model) {
    if (!this.hasRelationship(key)) {
      throw Exception.forbiddenRelationship(key)
    }

    this.#setRelationship(key, model)

    this.#emit(Model.ATTACHED, { key, model: this, attached: model })

    return this
  }

  /**
   * Detach a model from a relationship
   * @param key
   * @param model
   */
  detach (key, model) {
    if (!this.hasRelationship(key)) {
      throw Exception.forbiddenRelationship(key)
    }

    this.relationship(key).detach(model)

    this.#emit(Model.DETACHED, { key, model: this, detached: model })

    return this
  }

  /**
   * Add an include query
   * @param args
   * @returns {Model}
   */
  include (...args) {
    this.#builder?.include(...args)
    return this
  }

  /**
   * Add an append query
   * @param args
   * @returns {Model}
   */
  append (...args) {
    this.#builder?.append(...args)
    return this
  }

  /**
   * Add a select query
   * @param fields
   * @returns {Model}
   */
  select (...fields) {
    this.#builder?.select(...fields)
    return this
  }

  /**
   * Add a where query
   * @param field
   * @param value
   * @returns {Model}
   */
  where (field, value) {
    this.#builder?.where(field, value)
    return this
  }

  /**
   * Add a where in query
   * @param field
   * @param array
   * @returns {Model}
   */
  whereIn (field, array) {
    this.#builder?.whereIn(field, array)
    return this
  }

  /**
   * Add an order by query
   * @param args
   * @returns {Model}
   */
  orderBy (...args) {
    this.#builder?.orderBy(...args)
    return this
  }

  /**
   * Add a page query
   * @param value
   * @returns {Model}
   */
  page (value) {
    this.#builder?.page(value)
    return this
  }

  /**
   * Add a limit query
   * @param value
   * @returns {Model}
   */
  limit (value) {
    this.#builder?.limit(value)
    return this
  }

  /**
   * Get a collection of resources
   * @returns {Promise<*>}
   */
  async get (asCollection = false) {
    const response = await this.http.get(`${this.baseUri}${this.#builder.query()}`)

    const collection = asCollection ? Paginator.fromResponse(response.data) : new Paginator(response.data)

    this.#emit(Model.COLLECTED, { response, collection, model: this })

    return collection
  }

  /**
   * Get a single resource
   * @param id
   * @returns {Promise<*>}
   */
  async find (id) {
    const response = await this.http.get(`${this.baseUri}/${id}${this.#builder.query()}`)

    const model = Model.hydrate(response.data)

    this.#emit(Model.FETCHED, { model, response })

    return Promise.resolve(model)
  }

  /**
   * Delete the resource from storage
   * @returns {Promise<*>}
   */
  async delete () {
    if (this.isNew) {
      throw Exception.cannotDeleteModel(this)
    }

    const response = await this.http.delete(`${this.baseUri}/${this.id}`)

    if (this.#canBeDestroyed(response)) {
      this.wasDestroyed = true
      this.#emit(Model.DESTROYED, { response, model: this })
    }

    if (!this.wasDestroyed && this.#isTrashable() && !this.isTrashed()) {
      this.attribute(this.trashedAttribute, formatISO(new Date()))
      this.#emit(Model.TRASHED, { response, model: this })
    }

    return Promise.resolve(response)
  }

  /**
   * Helper to see if the model is trashable
   * @returns {boolean}
   * @private
   */
  #isTrashable () {
    return this.attributes?.[this.trashedAttribute] !== undefined
  }

  /**
   * Helper to see if the wasDestroyed flag should be set
   * @param response
   * @returns {boolean}
   * @private
   */
  #canBeDestroyed (response) {
    const wasSuccessful = response.status === Response.NO_CONTENT

    if (!this.#isTrashable()) {
      return wasSuccessful
    }

    return wasSuccessful && this.isTrashed()
  }

  /**
   * Persist or update the resource in storage
   * @returns {Promise<*>}
   */
  async createOrUpdate () {
    return await (this.isNew ? this.create() : this.update())
  }

  /**
   * Persist the resource in storage
   * @returns {Promise<*>}
   */
  async create () {
    if (!this.isNew) {
      throw Exception.cannotCreateModel(this)
    }

    const response = await this.http.post(this.baseUri, this.toJSON())

    if (response.status === Response.CREATED) {
      await this.#autoSaveRelationships()

      this.isNew = false
      this.#emit([Model.CREATED, Model.SAVED], { response, model: this })
    }

    return Promise.resolve(response)
  }

  /**
   * Update the resource in storage
   * @returns {Promise<*>}
   */
  async update () {
    if (this.isNew) {
      throw Exception.cannotUpdateModel(this)
    }

    const response = await this.http.put(`${this.baseUri}/${this.id}`, this.toJSON())

    if (response.status === Response.NO_CONTENT) {
      await this.#autoSaveRelationships()

      this.#emit([Model.UPDATED, Model.SAVED], { response, model: this })
    }

    return Promise.resolve(response)
  }

  /**
   * Automatically save any relationships
   * @returns {Promise<array>}
   * @private
   */
  async #autoSaveRelationships () {
    if (!Model.$config.autoSaveRelationships) {
      return Promise.resolve([])
    }

    try {
      return await this.saveRelationships()
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * Detect any changes to the relationship models and save them
   *
   * @returns {Promise<array>}
   */
  async saveRelationships () {
    const calls = collect(this.relationships)
      .filter(rel => !rel.readonly)
      .reduce(this.#flattenRelationships, [])
      .filter(model => model.isDirty() || model.isNew)
      .map(model => model.createOrUpdate().catch(err => err))

    const responses = await Promise.all(calls)

    this.#emit(Model.RELATIONS_SAVED, { responses, model: this })

    return responses
  }

  /**
   * Flatten all resolved relationships into a collection
   * @param models
   * @param relationship
   * @returns {*}
   * @private
   */
  #flattenRelationships (models, relationship) {
    const result = relationship.resolve()

    if (result instanceof Model) {
      models.push(result)
    } else {
      result.each(model => models.push(model))
    }

    return models
  }

  /**
   * @returns {Builder}
   */
  queryBuilder () {
    return this.#builder
  }

  /**
   * Get a new instance of the model
   * @returns {Model}
   */
  static instance () {
    return new this(null)
  }

  /**
   * Add an include clause to the query
   * @param args
   * @returns {Model}
   */
  static include (...args) {
    return this.instance().include(...args)
  }

  /**
   * Append one or more values to the query
   * @param args
   * @returns {Model}
   */
  static append (...args) {
    return this.instance().append(...args)
  }

  /**
   * Add a select clause to the query
   * @param fields
   * @returns {Model}
   */
  static select (...fields) {
    return this.instance().select(...fields)
  }

  /**
   * Add a where clause to the query
   * @param field
   * @param value
   * @returns {Model}
   */
  static where (field, value) {
    return this.instance().where(field, value)
  }

  /**
   * Add a where in clause to the query
   * @param field
   * @param array
   * @returns {Model}
   */
  static whereIn (field, array) {
    return this.instance().whereIn(field, array)
  }

  /**
   * Add an order by clause to the query
   * @param args
   * @returns {Model}
   */
  static orderBy (...args) {
    return this.instance().orderBy(...args)
  }

  /**
   * Add the page to the query
   * @param value
   * @returns {Model}
   */
  static page (value) {
    return this.instance().page(value)
  }

  /**
   * Add a limit clause to the query
   * @param value
   * @returns {Model}
   */
  static limit (value) {
    return this.instance().limit(value)
  }

  /**
   * Find a resource by its id
   * @param id
   * @returns {Promise<*>}
   */
  static find (id) {
    return this.instance().find(id)
  }

  /**
   * Get a collection of resources
   * @param asCollection
   * @returns {Promise<*>}
   */
  static get (asCollection = false) {
    return this.instance().get(asCollection)
  }

  /**
   * Sets the config
   * @param config
   */
  static setConfig (config) {
    Model.$config = config

    if (Model.$config?.events === undefined) {
      Model.$config.events = new Emitter()
    }

    if (Model.$config?.namespace === undefined) {
      Model.$config.namespace = 'belay'
    }

    if (Model.$config?.autoSaveRelationships === undefined) {
      Model.$config.autoSaveRelationships = true
    }
  }
}

export default Model
