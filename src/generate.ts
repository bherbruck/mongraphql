import { GraphQLSchema } from 'graphql'
import { makeSchema } from 'nexus'
import { join as joinPath, resolve as resolvePath } from 'path'
import { createSchema } from './schema/create-schema'

export function generate(schema: GraphQLSchema, outputDir: string = './') {
  const output = resolvePath(
    ['.', './'].includes(outputDir)
      ? joinPath(process.cwd(), outputDir)
      : outputDir
  )
  const generatedSchema = makeSchema({
    types: [...createSchema(schema)],
    outputs: outputDir
      ? {
          schema: joinPath(output, 'schema.graphql'),
          typegen: joinPath(output, 'typings.ts'),
        }
      : undefined,
  })

  return generatedSchema
}
