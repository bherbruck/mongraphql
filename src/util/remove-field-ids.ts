import { withoutId } from './transform-id'

export function removeFieldIds<T>(document: T): T {
  if (!document) return document
  return Object.entries(document).reduce((acc, [key, value]) => {
    const field = { [withoutId(key)]: value }
    return { ...acc, ...field }
  }, {} as T)
}
