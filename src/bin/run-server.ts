import { readFile } from 'fs/promises'
import { buildSchema } from 'graphql'
import parseArgs from 'minimist'
import { createServer } from '../server'

async function main() {
  const { port, mongoUrl, schemaPath } = parseArgs(process.argv, {
    default: {
      port: 4000,
    }
  })

  if (!mongoUrl || !schemaPath) {
    console.error('Missing required arguments: mongoUrl, schemaPath')
    process.exit(1)
  }

  const schema = buildSchema(await readFile(schemaPath, 'utf8'))
  const server = await createServer(mongoUrl, schema)

  server.listen(port, () => {
    console.log(`🚀 Server ready at: http://localhost:${port}`)
  })
}

main()
