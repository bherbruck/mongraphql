import { MongoClient } from 'mongodb'

export const mongoClient = new MongoClient('mongodb://db/graphql')
export const db = mongoClient.db('graphql')

export const context = {
  db,
} as const

export type Context = typeof context
