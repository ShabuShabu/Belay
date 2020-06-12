## Check if these are handled properly in proxyHandler

/**
 * Add event handlers for the SAVED event
 * @param handler
 */
static onSaved(handler) {
  this.on(this.SAVED, handler)
}

/**
 * Add event handlers for the CREATED event
 * @param handler
 */
static onCreated(handler) {
  this.on(this.CREATED, handler)
}

/**
 * Add event handlers for the UPDATED event
 * @param handler
 */
static onUpdated(handler) {
  this.on(this.UPDATED, handler)
}

/**
 * Add event handlers for the TRASHED event
 * @param handler
 */
static onTrashed(handler) {
  this.on(this.TRASHED, handler)
}

/**
 * Add event handlers for the FETCHED event
 * @param handler
 */
static onFetched(handler) {
  this.on(this.FETCHED, handler)
}

/**
 * Add event handlers for the ATTACHED event
 * @param handler
 */
static onAttached(handler) {
  this.on(this.ATTACHED, handler)
}

/**
 * Add event handlers for the DETACHED event
 * @param handler
 */
static onDetached(handler) {
  this.on(this.DETACHED, handler)
}

/**
 * Add event handlers for the DESTROYED event
 * @param handler
 */
static onDestroyed(handler) {
  this.on(this.DESTROYED, handler)
}

/**
 * Add event handlers for the COLLECTED event
 * @param handler
 */
static onCollected(handler) {
  this.on(this.COLLECTED, handler)
}

/**
 * Add event handlers for the RELATIONS_SAVED event
 * @param handler
 */
static onRelationsSaved(handler) {
  this.on(this.RELATIONS_SAVED, handler)
}

/**
 * Add event handlers for the ATTRIBUTE_SET event
 * @param handler
 */
static onAttributeSet(handler) {
  this.on(this.ATTRIBUTE_SET, handler)
}

/**
 * Add event handlers for the ATTRIBUTE_REMOVED event
 * @param handler
 */
static onAttributeRemoved(handler) {
  this.on(this.ATTRIBUTE_REMOVED, handler)
}

/**
 * Add event handlers for the RELATIONSHIP_SET event
 * @param handler
 */
static onRelationshipSet(handler) {
  this.on(this.RELATIONSHIP_SET, handler)
}

/**
 * Add event handlers for the RELATIONSHIP_REMOVED event
 * @param handler
 */
static onRelationshipRemoved(handler) {
  this.on(this.RELATIONSHIP_REMOVED, handler)
}
