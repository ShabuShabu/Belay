import get from 'lodash/get'
import { Relation } from '../Hierarchies'

export class HasOne extends Relation {
  /**
   * Resolves the model of the relationship
   * @returns {null|Model}
   */
  resolve () {
    const id = this.parent?.resource?.data?.relationships?.[this.key]?.data?.id

    if (id === undefined) {
      return null
    }

    return this.findInclude(id)
  }

  /**
   * Sets a model as the relationship
   * @param model
   * @returns {Relation}
   */
  attach (model) {
    this.guardAgainstInvalidRelation(model)

    return this.setRelation({
      data: this.relationFromModel(model)
    })
  }

  /**
   * Removes a model from the relationship
   * @param model
   * @returns {Relation}
   */
  detach (model) {
    this.guardAgainstInvalidRelation(model)

    const currentId = get(
      this.parent.resource,
      `data.relationships.${this.key}.data.id`
    )

    if (currentId === model.id) {
      return this.setRelation(null)
    }

    return this
  }
}

export default HasOne
