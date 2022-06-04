import { GraphQLObjectType, GraphQLSchema, isObjectType } from 'graphql'
import { createInputs } from './augment/create-inputs'
import { createMutations } from './augment/create-mutations'
import { createObjectType } from './augment/create-object-type'
import { createQueries } from './augment/create-queries'

export function createSchema(schema: GraphQLSchema) {
  const typeMap = schema.getTypeMap()
  const types = Object.keys(typeMap)
    .filter((key) => !key.startsWith('__'))
    .map((key) => schema.getType(key))
    .filter((t) => isObjectType(t)) as GraphQLObjectType[]

  const definitions = types
    .map((typeDef) => {
      const objectTypeDef = createObjectType(typeDef)
      const { nonNullInput, nullableInput } = createInputs(typeDef)
      const queries = createQueries(objectTypeDef, nullableInput)
      const { createMutation, updateMutation, deleteMutation } =
        createMutations(objectTypeDef, nullableInput, nonNullInput)

      return [
        objectTypeDef,
        queries,
        createMutation,
        updateMutation,
        deleteMutation,
      ]
    })
    .flat()

  return definitions
}
