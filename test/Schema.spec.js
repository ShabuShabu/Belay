import { c, m } from './responses/responses'
import categorySchema from './schemas/category'
import { Schema } from './helpers/Hierarchies'

describe('Schema', () => {
  test('it can check if a resource is valid json:api data', () => {
    const schema = new Schema()

    expect(schema.isJsonApi(c.categories)).toEqual(true)
    expect(schema.isJsonApi(m.stream)).toEqual(true)
    expect(schema.isJsonApi({})).toEqual(false)
  })

  test('it can combine multiple schema and validate those', () => {
    const schema = new Schema(categorySchema)

    expect(schema.validate(m.categories)).toEqual(true)
    expect(schema.validate(m.stream)).toEqual(false)
  })
})
