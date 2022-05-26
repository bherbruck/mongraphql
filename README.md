# mongraphql

[mongraphql](https://github.com/bherbruck/mongraphql) is an experimental project to create an _instant_ mongodb graphql server (or schema with CRUD resolvers) from **only** graphql type definitions.

## Motivation

I hate boilerplate. Graphql apis written in nodejs have **way** too much boilerplate. This is heavily inspired by [dgraph](https://dgraph.io/).

## Features

- npm package that can be used to augment an existing schema
- instant graphql server from **only** a `.graphql` schema using:
  - npm executable package
  - docker image

## Roadmap

- add mongo query filters for graphql
- add graphql decorator support for things like auth and custom relations

## Example

```graphql
type User {
  _id: ID!
  name: String!
  posts: [Post]
}

type Post {
  _id: ID!
  title: String!
  content: String!
  author: User!
  comments: [Comment]
}

type Comment {
  _id: ID!
  content: String!
  post: Post!
}
```

generates... (with mogodb CRUD resolvers)

```graphql
type User {
  _id: ID!
  name: String!
  posts: [Post]
}

type Post {
  _id: ID!
  author: User!
  comments: [Comment]
  content: String!
  title: String!
}

type Comment {
  _id: ID!
  content: String!
  post: Post!
}

type Query {
  comment(query: NullableCommentInput): Comment
  comments(query: NullableCommentInput): [Comment]
  post(query: NullablePostInput): Post
  posts(query: NullablePostInput): [Post]
  user(query: NullableUserInput): User
  users(query: NullableUserInput): [User]
}

type Mutation {
  createComment(data: NonNullCommentInput): Comment
  createPost(data: NonNullPostInput): Post
  createUser(data: NonNullUserInput): User
  deleteComment(_id: String): Comment
  deletePost(_id: String): Post
  deleteUser(_id: String): User
  updateComment(_id: String, data: NullableCommentInput): Comment
  updatePost(_id: String, data: NullablePostInput): Post
  updateUser(_id: String, data: NullableUserInput): User
}

input NonNullUserInput {
  name: String!
}

input NonNullPostInput {
  authorId: ID!
  content: String!
  title: String!
}

input NonNullCommentInput {
  content: String!
  postId: ID!
}

input NullablePostInput {
  _id: ID
  authorId: ID
  content: String
  title: String
}

input NullableUserInput {
  _id: ID
  name: String
}

input NullableCommentInput {
  _id: ID
  content: String
  postId: ID
}
```
