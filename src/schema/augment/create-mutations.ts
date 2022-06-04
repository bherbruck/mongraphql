import type {
  NexusInputObjectTypeDef,
  NexusObjectTypeDef,
} from 'nexus/dist/core'
import { mutationField } from 'nexus'
import { Context } from '../../types'
import { withFieldIds } from '../../util/with-field-ids'
import { ObjectId } from 'mongodb'
import { getCases } from '../../util/get-cases'

export const createMutations = <T extends string>(
  objectTypeDef: NexusObjectTypeDef<T>,
  nullableInput: NexusInputObjectTypeDef<T>,
  nonNullInput: NexusInputObjectTypeDef<T>
) => {
  const { camelCase, pascalCase } = getCases(objectTypeDef.name)

  const createMutation = mutationField(`create${pascalCase}`, {
    type: objectTypeDef,
    args: {
      data: nonNullInput.asArg(),
    },
    resolve: async (_, { data }, { db }: Context) => {
      const dataWithFieldIds = withFieldIds(data)
      const { insertedId } = await db
        .collection(camelCase)
        .insertOne(dataWithFieldIds)
      const insertedDocument = await db.collection(camelCase).findOne({
        _id: insertedId,
      })
      return insertedDocument
    },
  })

  const updateMutation = mutationField(`update${pascalCase}`, {
    type: objectTypeDef,
    args: {
      _id: 'String',
      data: nullableInput.asArg(),
    },
    resolve: async (_, { _id, data }, { db }: Context) => {
      const dataWithFieldIds = withFieldIds(data)
      const objectId = new ObjectId(_id)
      const { acknowledged } = await db
        .collection(camelCase)
        .updateOne({ _id: objectId }, { $set: dataWithFieldIds })
      if (!acknowledged) return
      const updatedDocument = await db.collection(camelCase).findOne({
        _id: objectId,
      })
      return updatedDocument
    },
  })

  const deleteMutation = mutationField(`delete${pascalCase}`, {
    type: objectTypeDef,
    args: {
      _id: 'String',
    },
    resolve: async (_, { _id }, { db }: Context) => {
      const objectId = new ObjectId(_id)
      const document = await db.collection(camelCase).findOne({ _id: objectId })
      const { deletedCount } = await db
        .collection(camelCase)
        .deleteOne({ _id: objectId })
      return deletedCount > 0 ? document : null
    },
  })

  return { createMutation, updateMutation, deleteMutation }
}
