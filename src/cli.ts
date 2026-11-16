#!/usr/bin/env node
import { generatePalette, toCSSTokens } from './index.js'
import type { Theme } from './types.js'

const HELP = `
Usage: accessible-color-palette <color> <theme> [options]

Arguments:
  color            Hex (with or without #, 3 or 6 chars), "rgb(r, g, b)" or "hsl(h, s%, l%)"
                   — quote rgb()/hsl() so your shell doesn't eat the parentheses
  theme            Background theme: white | black

Options:
  --json           Output full palette + usage map as JSON
  --prefix <name>  CSS variable prefix (default: color)
  -h, --help       Show this help message

Examples:
  accessible-color-palette 1F7A54 white
  accessible-color-palette "#239062" black --prefix brand
  accessible-color-palette 1F7A54 white --json
  accessible-color-palette "rgb(31, 122, 84)" white
  accessible-color-palette "hsl(155, 59%, 30%)" black
`.trim()

const args = process.argv.slice(2)

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(HELP)
  process.exit(0)
}

const positional: string[] = []
let prefix = 'color'
let json = false

for (let i = 0; i < args.length; i++) {
  const arg = args[i] ?? ''
  if (arg === '--json') {
    json = true
  } else if (arg === '--prefix') {
    const next = args[i + 1]
    if (!next || next.startsWith('-')) {
      console.error('Error: --prefix requires a value')
      process.exit(1)
    }
    prefix = next
    i++
  } else if (!arg.startsWith('-')) {
    positional.push(arg)
  } else {
    console.error(`Unknown option: ${arg}`)
    console.error(HELP)
    process.exit(1)
  }
}

const [hex, theme] = positional

if (!hex || !theme) {
  console.error('Error: hex and theme are required\n')
  console.error(HELP)
  process.exit(1)
}

if (theme !== 'white' && theme !== 'black') {
  console.error(`Error: theme must be "white" or "black", got "${theme}"`)
  process.exit(1)
}

try {
  const result = generatePalette(hex, theme as Theme)
  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log(toCSSTokens(result, prefix))
  }
} catch (err) {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
}
