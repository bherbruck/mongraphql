import { withoutId } from './transform-id'

export function removeFieldIds(document: any) {
  return Object.entries(document).reduce((acc, [key, value]) => {
    const field = { [withoutId(key)]: value }
    return { ...acc, ...field }
  }, {})
}
