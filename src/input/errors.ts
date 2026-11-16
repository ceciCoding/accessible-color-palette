export type InvalidColorFormat = 'hex' | 'rgb' | 'hsl' | 'unknown'

// The ONLY class in the codebase (documented exception in AGENTS.md):
// `instanceof` against an Error subtype requires a constructor.
export class InvalidColorError extends Error {
  readonly format: InvalidColorFormat
  readonly input: string

  constructor(format: InvalidColorFormat, input: string, message: string) {
    super(message)
    this.name = 'InvalidColorError'
    this.format = format
    this.input = input
  }
}
