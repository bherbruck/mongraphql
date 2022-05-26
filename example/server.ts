import { buildASTSchema } from 'graphql'
import { gql } from 'graphql-tag'
import { createServer } from '../src/server'

const ast = gql`
  type User {
    _id: ID!
    name: String!
    posts: [Post]
  }

  type Post {
    _id: ID!
    title: String!
    content: String!
    user: User!
    comments: [Comment]
  }

  type Comment {
    _id: ID!
    content: String!
    post: Post!
  }
`

const mongoUrl = 'mongodb://db/graphql'
const schema = buildASTSchema(ast)

createServer(mongoUrl, schema).then(async (server) => {
  const port = process.env.PORT ?? 4000
  server.listen(port, () =>
    console.log(`🚀 GraphQL server ready at: http://localhost:${port}`)
  )
})
