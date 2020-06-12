import get from 'lodash/get'
import { collect } from '../Collection'
import { Relation } from '../Hierarchies'

export class HasMany extends Relation {
  /**
   * Resolves the relationship
   * @returns {Collection|null}
   */
  resolve () {
    const relationships = this.parent?.resource?.data?.relationships?.[this.key]

    if (relationships === undefined) {
      return collect()
    }

    return collect(
      relationships.map(relation => this.findInclude(relation.id))
    )
  }

  /**
   * Adds a model to the relationship
   * @param model
   * @returns {Relation}
   */
  attach (model) {
    this.guardAgainstInvalidRelation(model)

    const existing = get(this.parent.resource, `data.relationships.${this.key}`, [])

    existing.push(this.relationFromModel(model))

    return this.setRelation(existing)
  }

  /**
   * Removes a model from the relationship
   * @param model
   * @returns {Relation}
   */
  detach (model) {
    this.guardAgainstInvalidRelation(model)

    const existing = get(this.parent.resource, `data.relationships.${this.key}`, [])

    return this.setRelation(
      existing.filter(rel => rel.id !== model.id)
    )
  }
}

export default HasMany
