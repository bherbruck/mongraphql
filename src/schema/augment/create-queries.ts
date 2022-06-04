import type { Document, Filter } from 'mongodb'
import { extendType, nullable } from 'nexus'
import type {
  NexusInputObjectTypeDef,
  NexusObjectTypeDef,
} from 'nexus/dist/core'
import { plural } from 'pluralize'
import { Context } from '../../types'
import { getCases } from '../../util/get-cases'
import { withFieldIds } from '../../util/with-field-ids'

export const createQueries = (
  objectTypeDef: NexusObjectTypeDef<string>,
  inputObjectTypeDef: NexusInputObjectTypeDef<string>
) => {
  const { camelCase } = getCases(objectTypeDef.name)

  const queries = extendType({
    type: 'Query',
    definition(t) {
      // query many
      t.list.field(plural(camelCase), {
        type: objectTypeDef,
        args: {
          query: nullable(inputObjectTypeDef.asArg()),
        },
        resolve: async (_, { query }, { db }: Context) => {
          const queryWithFieldIds = withFieldIds(query)
          const results = await db
            .collection(camelCase)
            .find(queryWithFieldIds as Filter<Document>)
            .toArray()
          return results ?? []
        },
      })

      // query one
      t.field(camelCase, {
        type: objectTypeDef,
        args: {
          query: nullable(inputObjectTypeDef.asArg()),
        },
        resolve: async (_, { query }, { db }: Context) => {
          const queryWithFieldIds = withFieldIds(query)
          const result = await db
            .collection(camelCase)
            .findOne(queryWithFieldIds as Filter<Document>)
          return result
        },
      })
    },
  })

  return queries
}
