/* eslint-disable no-new */

import schema from './schemas/user'
import { m } from './responses/responses'
import { TestModel } from './helpers/Hierarchies'

describe('Model Exceptions', () => {
  test('it throws an exception when Axios is not set', () => {
    TestModel.reset()

    const errorModel = () => { new TestModel() }

    expect(errorModel).toThrow('You must set Axios on the base model')
  })

  test('it throws an exception when the type map is not set', () => {
    TestModel.reset()
      .withAxios()

    const errorModel = () => { new TestModel() }

    expect(errorModel).toThrow('You must set a type map on the base model')
  })

  test('it throws an exception when the JSON:API type is not set', () => {
    TestModel.reset()
      .withAxios()
      .withTypeMap()
      .withEvents()

    const errorModel = () => { new TestModel() }

    expect(errorModel).toThrow('Property JSON:API type is not set for model [TestModel]')
  })

  test('it throws an exception when no property defaults are set', () => {
    TestModel.reset()
      .withAxios()
      .withTypeMap()
      .withEvents()
      .withApiType()

    const errorModel = () => { new TestModel() }

    expect(errorModel).toThrow('Property defaults are not set for model [TestModel]')
  })

  test('it throws an exception when an invalid resource is passed', () => {
    TestModel.reset()
      .withAxios()
      .withTypeMap()
      .withEvents()
      .withApiType()
      .withDefaults()

    const errorModel = () => { new TestModel() }

    expect(errorModel).toThrow('Invalid resource was passed')
  })

  test('it throws an exception when an invalid attribute is set', () => {
    TestModel.reset()
      .withAxios()
      .withTypeMap()
      .withEvents()
      .withApiType()
      .withDefaults()

    const errorModel = () => {
      new TestModel(m.users, schema).attribute('thing', null)
    }

    expect(errorModel).toThrow('Attribute [thing] is not allowed')
  })

  test('it throws an exception when a type is not registered', () => {
    TestModel.reset()

    const errorModel = () => {
      TestModel.entityForType('bla')
    }

    expect(errorModel).toThrow('No model mapping exists for [bla]')
  })

  test('it throws an exception when an invalid relationship is set', () => {
    TestModel.reset()
      .withAxios()
      .withTypeMap()
      .withEvents()
      .withApiType()
      .withDefaults()

    const errorModel = () => {
      new TestModel(m.users, schema).relationship('thing', null)
    }

    expect(errorModel).toThrow('Relationship [thing] is not allowed')
  })

  test('it throws an exception when a model cannot be updated', async () => {
    TestModel.reset()
      .withAxios()
      .withTypeMap()
      .withEvents()
      .withApiType()
      .withDefaults()

    const errorModel = async () => {
      await new TestModel(undefined, schema).update()
    }

    await expect(errorModel()).rejects.toEqual(
      Error('The [Object] model is new and cannot be updated')
    )
  })

  test('it throws an exception when a model cannot be deleted', async () => {
    TestModel.reset()
      .withAxios()
      .withTypeMap()
      .withEvents()
      .withApiType()
      .withDefaults()

    const errorModel = async () => {
      await new TestModel(undefined, schema).delete()
    }

    await expect(errorModel()).rejects.toEqual(
      Error('The [Object] model is new and cannot be deleted')
    )
  })

  test('it throws an exception when a model cannot be created', async () => {
    TestModel.reset()
      .withAxios()
      .withTypeMap()
      .withEvents()
      .withApiType()
      .withDefaults()

    const errorModel = async () => {
      await new TestModel(m.users, schema).create()
    }

    await expect(errorModel()).rejects.toEqual(
      Error('The [Object] model is not new and cannot be created')
    )
  })
})
