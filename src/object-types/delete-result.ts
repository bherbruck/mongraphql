import { objectType } from 'nexus'

export const deleteResult = objectType({
  name: 'DeleteResult',
  definition(t) {
    t.field('deletedCount', { type: 'Int' })
  },
})
