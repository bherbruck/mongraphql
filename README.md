# mongraphql

`mongraphql` is an experimental way to create an executable graphql schema with mongodb CRUD resolvers from **only** graphl type definitions.

# Motivation

I hate boilerplate. This is heavily inspired by [dgraph](https://dgraph.io/).

# Goals

- npm package that can be used to augment an existing schema
- instant graphql server from **only** a `.graphql` schema using:
  - npm executable package
  - docker image
- graphql decorator support for things like auth and custom relations
