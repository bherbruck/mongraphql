# mongraphql

[mongraphql](https://github.com/bherbruck/mongraphql) is an experimental project create an __instant__ mongodb graphql server (or schema with CRUD resolvers) from **only** graphql type definitions.

# Motivation

I hate boilerplate. This is heavily inspired by [dgraph](https://dgraph.io/).

# Goals

- npm package that can be used to augment an existing schema
- instant graphql server from **only** a `.graphql` schema using:
  - npm executable package
  - docker image
- graphql decorator support for things like auth and custom relations
