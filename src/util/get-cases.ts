import { pascalCase, camelCase } from 'change-case'

export const getCases = (text: string) => ({
  pascalCase: pascalCase(text),
  camelCase: camelCase(text),
})
