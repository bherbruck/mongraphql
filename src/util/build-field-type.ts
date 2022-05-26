import { camelCase } from 'change-case'
import {
  GraphQLOutputType,
  isListType,
  isNonNullType,
  isObjectType,
} from 'graphql'
import { ObjectId } from 'mongodb'
import { FieldResolver, list, nonNull } from 'nexus'
import { Context } from '../types'
import { removeFieldIds } from './remove-field-ids'
import { withId } from './transform-id'

export function buildFieldType(
  rootType: string,
  type: GraphQLOutputType,
  next: typeof nonNull | typeof list | undefined = undefined
): { type: any; resolve?: FieldResolver<any, any> } {
  if (isListType(type)) return buildFieldType(rootType, type.ofType, list)
  if (isNonNullType(type)) return buildFieldType(rootType, type.ofType, nonNull)

  // @ts-ignore
  const returnType = next ? next(type.name) : type.name

  if (isObjectType(type) && next === list) {
    return {
      type: returnType,
      resolve: async (root, _, { db }: Context) => {
        const collectionName = camelCase(type.name)
        const query = {
          [withId(camelCase(rootType))]: new ObjectId(root['_id']),
        }
        const data = (
          await db.collection(collectionName).find(query).toArray()
        ).map((doc) => doc)
        return data
      },
    } as {
      type: any
      resolve: FieldResolver<any, any>
    }
  }

  if (isObjectType(type))
    return {
      type: returnType,
      resolve: async (root, _, { db }: Context) => {
        const collectionName = camelCase(type.name)
        const query = { _id: root[withId(collectionName)] }
        const data = await db.collection(collectionName).findOne(query)
        const dataWithoutFieldIds = removeFieldIds(data)
        return dataWithoutFieldIds
      },
    } as {
      type: any
      resolve: FieldResolver<any, any>
    }

  return { type: returnType }
}
