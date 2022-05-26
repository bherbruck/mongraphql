import { ApolloServer } from 'apollo-server'
import { createSchema } from './schema/create-schema'
import { type GraphQLSchema } from 'graphql'
import { MongoClient } from 'mongodb'
import { makeSchema } from 'nexus'

export async function createServer(mongoUrl: string, schema: GraphQLSchema) {
  const augmentedSchema = makeSchema({ types: [...createSchema(schema)] })

  const mongoClient = new MongoClient(mongoUrl)
  const db = mongoClient.db()
  await mongoClient.connect()

  const server = new ApolloServer({ schema: augmentedSchema, context: { db } })

  return server
}
