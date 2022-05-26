import { camelCase, pascalCase } from 'change-case'
import { GraphQLObjectType, GraphQLSchema, isObjectType } from 'graphql'
import { Document, Filter, ObjectId } from 'mongodb'
import {
  extendType,
  inputObjectType,
  mutationField,
  nullable,
  objectType,
} from 'nexus'
import { plural } from 'pluralize'
import { Context } from '../types'
import { buildFieldType } from '../util/build-field-type'
import { buildInputType } from '../util/build-input-type'
import { withId } from '../util/transform-id'
import { withFieldIds } from '../util/with-field-ids'

export function createSchema(schema: GraphQLSchema) {
  const typeMap = schema.getTypeMap()
  const types = Object.keys(typeMap)
    .filter((key) => !key.startsWith('__'))
    .map((key) => schema.getType(key))
    .filter((t) => isObjectType(t)) as GraphQLObjectType[]

  const definitions = types.map((typeDef) => {
    const pascalCaseName = pascalCase(typeDef.name)
    const camelCaseName = camelCase(typeDef.name)
    const fields = typeDef.getFields()

    const objectTypeDef = objectType({
      name: pascalCaseName,
      definition(t) {
        Object.values(fields).forEach((field) => {
          const { type, resolve } = buildFieldType(camelCaseName, field.type)
          t.field(field.name, {
            type,
            resolve,
          })
        })
      },
    })

    // input of the type with non-null fields preserved
    const nonNullInput = inputObjectType({
      name: `NonNull${pascalCaseName}Input`,
      definition(t) {
        Object.values(fields).forEach((field) => {
          if (field.name === '_id') return
          const type = buildInputType(field.type)
          if (!type) return
          const fieldName = type?.isId ? withId(field.name) : field.name
          t.field(fieldName, {
            type: type.type,
          })
        })
      },
    })

    // input of the type with all fields nullable
    const nullableInput = inputObjectType({
      name: `Nullable${pascalCaseName}Input`,
      definition(t) {
        Object.values(fields).forEach((field) => {
          const type = buildInputType(field.type)
          if (!type) return
          const fieldName = type?.isId ? withId(field.name) : field.name
          t.field(fieldName, {
            type: nullable(type.type),
          })
        })
      },
    })

    const query = extendType({
      type: 'Query',
      definition(t) {
        t.list.field(plural(camelCaseName), {
          type: objectTypeDef,
          args: {
            query: nullable(nullableInput.asArg()),
          },
          resolve: async (_, { query }, { db }: Context) => {
            const queryWithFieldIds = withFieldIds(query)
            const results = await db
              .collection(camelCaseName)
              .find(queryWithFieldIds as Filter<Document>)
              .toArray()
            return results ?? []
          },
        })
        t.field(camelCaseName, {
          type: objectTypeDef,
          args: {
            query: nullable(nullableInput.asArg()),
          },
          resolve: async (_, { query }, { db }: Context) => {
            const queryWithFieldIds = withFieldIds(query)
            const result = await db
              .collection(camelCaseName)
              .findOne(queryWithFieldIds as Filter<Document>)
            return result
          },
        })
      },
    })

    const createMutation = mutationField(`create${pascalCaseName}`, {
      type: objectTypeDef,
      args: {
        data: nonNullInput.asArg(),
      },
      resolve: async (_, { data }, { db }: Context) => {
        const dataWithFieldIds = withFieldIds(data)
        const { insertedId } = await db
          .collection(camelCaseName)
          .insertOne(dataWithFieldIds)
        const insertedDocument = await db.collection(camelCaseName).findOne({
          _id: insertedId,
        })
        return insertedDocument
      },
    })

    const updateMutation = mutationField(`update${pascalCaseName}`, {
      type: objectTypeDef,
      args: {
        _id: 'String',
        data: nullableInput.asArg(),
      },
      resolve: async (_, { _id, data }, { db }: Context) => {
        const dataWithFieldIds = withFieldIds(data)
        const objectId = new ObjectId(_id)
        const { acknowledged } = await db
          .collection(camelCaseName)
          .updateOne({ _id: objectId }, { $set: dataWithFieldIds })
        if (!acknowledged) return
        const updatedDocument = await db.collection(camelCaseName).findOne({
          _id: objectId,
        })
        return updatedDocument
      },
    })

    const deleteMutation = mutationField(`delete${pascalCaseName}`, {
      type: objectTypeDef,
      args: {
        _id: 'String',
      },
      resolve: async (_, { _id }, { db }: Context) => {
        const objectId = new ObjectId(_id)
        const document = await db
          .collection(camelCaseName)
          .findOne({ _id: objectId })
        const { deletedCount } = await db
          .collection(camelCaseName)
          .deleteOne({ _id: objectId })
        return deletedCount > 0 ? document : null
      },
    })

    return [
      objectTypeDef,
      query,
      createMutation,
      updateMutation,
      deleteMutation,
    ]
  })

  return definitions.reduce((pre, cur) => [...pre, ...cur], [])
}
