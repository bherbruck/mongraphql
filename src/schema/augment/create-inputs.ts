import type { GraphQLObjectType } from 'graphql'
import { inputObjectType, nullable } from 'nexus'
import { getCases } from '../../util/get-cases'
import { buildInputType } from '../../util/build-input-type'
import { withId } from '../../util/transform-id'

export const createInputs = (typeDef: GraphQLObjectType) => {
  const { pascalCase } = getCases(typeDef.name)
  const fields = typeDef.getFields()

  // input of the type with non-null fields preserved
  const nonNullInput = inputObjectType({
    name: `NonNull${pascalCase}Input`,
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
    name: `Nullable${pascalCase}Input`,
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

  return { nonNullInput, nullableInput }
}
