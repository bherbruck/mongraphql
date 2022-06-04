import type { GraphQLObjectType } from 'graphql'
import { objectType } from 'nexus'
import { buildFieldType } from '../../util/build-field-type'
import { getCases } from '../../util/get-cases'

export const createObjectType = (typeDef: GraphQLObjectType) => {
  const { camelCase, pascalCase } = getCases(typeDef.name)

  const objectTypeDef = objectType({
    name: pascalCase,
    definition(t) {
      Object.values(typeDef.getFields()).forEach((field) => {
        const { type, resolve } = buildFieldType(camelCase, field.type)
        t.field(field.name, { type, resolve })
      })
    },
  })

  return objectTypeDef
}
