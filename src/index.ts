import { ApolloServer } from 'apollo-server'
import { generate } from './generate'
import { context, mongoClient } from './context'
import { buildSchema } from 'graphql'
import { readFile } from 'fs/promises'

async function main() {
  const sdl = await readFile('./schema.graphql', 'utf8')
  const schema = generate(buildSchema(sdl), 'generated')
  const port = process.env.PORT || 4000

  await mongoClient.connect()

  // context.db.collection('').find({}).project()

  const server = new ApolloServer({ schema, context })

  await server.listen({ port }, () =>
    console.log(`🚀 Server ready at: http://localhost:${port}`)
  )
}

main()
