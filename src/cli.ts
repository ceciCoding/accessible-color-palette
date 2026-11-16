#!/usr/bin/env node
import { generateApcaPalette, generatePalette, toApcaCSSTokens, toCSSTokens } from './index.js'
import type { ContrastModel, Theme } from './types.js'

const HELP = `
Usage: accessible-color-palette <hex> <theme> [options]

Arguments:
  hex              Hex color (with or without #, 3 or 6 chars)
  theme            Background theme: white | black

Options:
  --model <name>   Contrast model: wcag2 (default) | apca
  --json           Output full palette + usage map as JSON
  --prefix <name>  CSS variable prefix (default: color)
  -h, --help       Show this help message

Examples:
  accessible-color-palette 1F7A54 white
  accessible-color-palette "#239062" black --prefix brand
  accessible-color-palette 1F7A54 white --json
  accessible-color-palette 1F7A54 white --model apca
`.trim()

const args = process.argv.slice(2)

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(HELP)
  process.exit(0)
}

const positional: string[] = []
let prefix = 'color'
let json = false
let model: ContrastModel = 'wcag2'

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
  } else if (arg === '--model') {
    const next = args[i + 1]
    if (next !== 'wcag2' && next !== 'apca') {
      console.error(`Error: --model must be "wcag2" or "apca", got "${next ?? ''}"`)
      process.exit(1)
    }
    model = next
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
  const validTheme = theme as Theme
  if (model === 'apca') {
    const result = generateApcaPalette(hex, validTheme)
    console.log(json ? JSON.stringify(result, null, 2) : toApcaCSSTokens(result, prefix))
  } else {
    const result = generatePalette(hex, validTheme)
    console.log(json ? JSON.stringify(result, null, 2) : toCSSTokens(result, prefix))
  }
} catch (err) {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
}
