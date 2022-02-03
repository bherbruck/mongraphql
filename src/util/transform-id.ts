export function withId<T extends string>(text: T): `${T}Id` {
  return `${text}Id`
}

export function withoutId<T extends string>(text: T): string {
  return text.replace(/Id$/, '')
}
