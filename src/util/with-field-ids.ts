import { ObjectId } from 'mongodb'

export function withFieldIds(data: object) {
  if (data == undefined) return data
  return Object.entries(data).reduce((acc, [key, value]) => {
    const field =
      key.toLocaleLowerCase().endsWith('id') && typeof value === 'string'
        ? { [key]: new ObjectId(value as string) }
        : { [key]: value }
    return { ...acc, ...field }
  }, {})
}
