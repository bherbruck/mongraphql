import {
  GraphQLOutputType,
  isListType,
  isNonNullType,
  isObjectType,
} from 'graphql'
import { nonNull } from 'nexus'

export function buildInputType(
  type: GraphQLOutputType,
  next: typeof nonNull = null
): { type: any; isId?: boolean } {
  if (isListType(type)) return
  if (isNonNullType(type)) return buildInputType(type.ofType, nonNull)
  if (isObjectType(type)) return { type: next('ID'), isId: true }
  if (next) return { type: next(type.name) }

  return { type: type.name }
}
