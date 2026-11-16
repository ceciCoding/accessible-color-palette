#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { generateApcaPalette, generatePalette, toApcaCSSTokens, toCSSTokens } from '../index.js'
import { buildCompatMatrix } from '../output/tokens.js'
import { buildApcaCompatMatrix } from '../output/apca-tokens.js'
import { validatePairings, checkContrast } from '../output/validation.js'
import { validateApcaPairings, checkApcaContrast } from '../output/apca-validation.js'
import { createRequire } from 'node:module'
import type { ContrastModel, Theme } from '../types.js'
import { SessionGate } from './session-gate.js'

// Single source of truth for the version: package.json. The server used to
// hardcode it and drifted three releases behind.
const require = createRequire(import.meta.url)
const pkg: { version: string } = require('../../package.json')

const server = new Server(
  { name: 'accessible-color-palette', version: pkg.version },
  { capabilities: { tools: {}, resources: {}, prompts: {} } }
)

const sessionGate = new SessionGate()

// ─── Shared argument parsing ─────────────────────────────────────────────────

function parseModel(raw: unknown): ContrastModel {
  if (raw === undefined || raw === 'wcag2') return 'wcag2'
  if (raw === 'apca') return 'apca'
  throw new Error('Invalid arguments: model must be "wcag2" or "apca"')
}

function parseHexTheme(args: Record<string, unknown>): { hex: string; theme: Theme } {
  const hex = args['hex']
  const theme = args['theme']
  if (typeof hex !== 'string' || (theme !== 'white' && theme !== 'black')) {
    throw new Error('Invalid arguments: hex must be string, theme must be "white" or "black"')
  }
  return { hex, theme }
}

const MODEL_PROPERTY = {
  type: 'string',
  enum: ['wcag2', 'apca'],
  description:
    'Contrast model. "wcag2" (default): WCAG 2.2 AA ratios (4.5:1 / 3:1), symmetric. "apca": APCA / WCAG 3 draft Lc values — DIRECTIONAL (shade-as-text on background; swapping roles changes the number), SIGNED (negative = light text on dark background), with role-based levels: preferred-text (|Lc| ≥ 90), body-text (≥ 75), content-text (≥ 60, headlines / large text), large-text (≥ 45, very large or bold text, icons), non-text (≥ 15, borders only — never text). Use the same model for every call in a task; a WCAG 2 validation does not carry over to APCA.',
} as const

// ─── Resources ───────────────────────────────────────────────────────────────

server.setRequestHandler(ListResourcesRequestSchema, () => ({ resources: [] }))

server.setRequestHandler(ListResourceTemplatesRequestSchema, () => ({
  resourceTemplates: [
    {
      uriTemplate: 'palette://{hex}/{theme}',
      name: 'Palette compatibility matrix (WCAG 2.2 AA)',
      description:
        'WCAG 2.2 AA compatibility matrix for a palette. Returns a JSON object mapping each shade (100–900) to the backgrounds it can be used on: bodyText (≥4.5:1, safe for any font size) and largeText (3:1–4.5:1, ≥24px or ≥18.67px bold only). Read this resource at the START of every design task — even if you read it earlier in the conversation. Context drift causes previously-learned rules to be ignored; re-reading resets your reference point to the authoritative data. This matrix only covers the FOUNDATION layer (one hue, varying lightness) — it says nothing about whether the design needs semantic accent colors (error/success/warning/info). Decide that separately; if you add one, validate it with check_contrast, not against this matrix.',
      mimeType: 'application/json',
    },
    {
      uriTemplate: 'palette://{hex}/{theme}/apca',
      name: 'Palette compatibility matrix (APCA / WCAG 3 draft)',
      description:
        'APCA compatibility matrix for a palette. Returns a JSON object mapping each shade (100–900) AS TEXT to the backgrounds it can sit on, grouped by role: preferredText (|Lc| ≥ 90), bodyText (≥ 75), contentText (≥ 60, headlines / large text only), largeText (≥ 45, very large or bold text, icons), nonText (≥ 15, borders / dividers — never text). APCA is DIRECTIONAL: the matrix is read as shade-as-text → background and is NOT valid with the roles swapped. Re-read it at the start of every design task. Same FOUNDATION-only caveat as the WCAG 2 matrix: accent colors must be validated separately with check_contrast using model "apca".',
      mimeType: 'application/json',
    },
  ],
}))

server.setRequestHandler(ReadResourceRequestSchema, (request) => {
  const { uri } = request.params
  const match = uri.match(/^palette:\/\/([0-9a-fA-F]{3,8})\/(white|black)(?:\/(wcag2|apca))?$/)

  if (!match) {
    throw new Error(
      `Invalid palette resource URI: "${uri}". Expected format: palette://{hex}/{theme} or palette://{hex}/{theme}/apca — e.g. palette://1f7a54/white`,
    )
  }

  const hex = match[1]!
  const theme = match[2]! as Theme
  const model = parseModel(match[3])

  const payload =
    model === 'apca'
      ? (() => {
          const result = generateApcaPalette(hex, theme)
          return { source: result.sourceColor, theme, model, shades: buildApcaCompatMatrix(result) }
        })()
      : (() => {
          const result = generatePalette(hex, theme)
          return { source: result.sourceColor, theme, model, shades: buildCompatMatrix(result) }
        })()

  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(payload, null, 2),
      },
    ],
  }
})

// ─── Prompts ─────────────────────────────────────────────────────────────────

server.setRequestHandler(ListPromptsRequestSchema, () => ({
  prompts: [
    {
      name: 'plan-palette-usage',
      description:
        'Use this prompt BEFORE writing any CSS that uses palette colors. It guides you through reading the compatibility matrix, validating every pairing, and only then generating code. Skipping this flow is the root cause of inaccessible color combinations.',
      arguments: [
        { name: 'hex', description: 'Source hex color (without #)', required: true },
        { name: 'theme', description: '"white" or "black" background', required: true },
        { name: 'model', description: '"wcag2" (default) or "apca"', required: false },
      ],
    },
  ],
}))

server.setRequestHandler(GetPromptRequestSchema, (request) => {
  const { name, arguments: promptArgs } = request.params

  if (name === 'plan-palette-usage') {
    const hex = (promptArgs?.['hex'] ?? '{hex}').toString().replace('#', '')
    const theme = (promptArgs?.['theme'] ?? '{theme}').toString()
    const model = parseModel(promptArgs?.['model'])

    const resourceUri = model === 'apca' ? `palette://${hex}/${theme}/apca` : `palette://${hex}/${theme}`
    const modelArg = model === 'apca' ? `, model: "apca"` : ''

    const planCheck =
      model === 'apca'
        ? `  Check: which bucket of matrix[shade-X] contains background Y? (matrix is shade-AS-TEXT → background)
    → preferredText / bodyText: ✓ safe for any size
    → contentText: ◐ headlines / large text only — mark it in the CSS comment
    → largeText: ⚠ very large or bold text, icons only — mark it in the CSS comment
    → nonText or absent: FAIL ✗ as text — I must choose a different shade
  APCA is DIRECTIONAL: if you also use shade-Y as text on shade-X, that is a
  SEPARATE pairing. Check it separately. Never assume symmetry.`
        : `  Check: is shade-X in matrix[shade-X].bodyText for background Y?
    → YES: aa-normal ✓ safe for any size
    → ONLY in largeText: aa-large ⚠ mark as large-text-only in CSS comment
    → NEITHER: FAIL ✗ — I must choose a different shade`

    const forbiddenSizeRule =
      model === 'apca'
        ? `✗ Using a content-text or large-text pairing for body copy because the text is
  "decorative", "secondary", "a tag/badge", or "non-critical" — the Lc levels
  are role minimums with no such exception. If you catch yourself reasoning your
  way around a level you just computed, that reasoning is wrong, not the rule.
✗ Reusing a pairing with text and background swapped without validating the
  reverse direction — APCA values are not symmetric.`
        : `✗ Using a large-text-only pairing below the size threshold because the text is
  "decorative", "secondary", "a tag/badge", or "non-critical" — WCAG 1.4.3 has
  no such exception. If you catch yourself reasoning your way around a level
  you just computed as failing, that reasoning is wrong, not the rule.`

    return {
      description: 'Plan-and-validate flow: Read resource → Plan pairings (in <thinking>) → validate_pairings (blocking) → generate_css_tokens',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You are about to write CSS using the palette generated from #${hex} on ${theme} (model: ${model}).

Execute these steps IN ORDER. Do NOT skip any step or proceed past a failure.

─── STEP 1 · READ (required at every new task) ─────────────────────────────
Call: read_resource("${resourceUri}")

IMPORTANT: re-read this even if you've already read it earlier in this conversation.
Prior CSS examples in the context can cause you to ignore previously-learned rules.
This re-read resets your reference point.

─── STEP 2 · PLAN inside <thinking> ────────────────────────────────────────
Before writing a single line of CSS, open a <thinking> block and, for each
component rule you plan to write, perform this explicit cross-check:

  Component: [name]
  Rule: [selector] → foreground: shade-X, background: shade-Y/white/black
${planCheck}

Do this for EVERY pairing. Do not skip any. Do not rely on memory from
prior examples — the statistics of previous CSS you generated are biased.

─── STEP 3 · VALIDATE (blocking loop) ──────────────────────────────────────
After your <thinking> cotejo, call:

  validate_pairings({
    hex: "${hex}",
    theme: "${theme}"${modelArg},
    pairings: [ ...every pair from your thinking block... ]
  })

The response includes a "proceed" field.
• proceed: false → you are BLOCKED. Fix every failing pair. Repeat Step 3.
• proceed: true  → you may continue to Step 4.

You MUST NOT output component CSS while proceed is false.
You MUST repeat this loop until proceed is true.

NOTE: this is not just guidance — it is enforced server-side. generate_css_tokens
will hard-reject (throw) for this exact hex+theme+model until validate_pairings has
returned proceed: true at least once in this session. Skipping this step does
not save you a round-trip; it costs you one.

─── STEP 4 · GENERATE ──────────────────────────────────────────────────────
Call: generate_css_tokens({ hex: "${hex}", theme: "${theme}"${modelArg} })

The response includes a NEXT REQUIRED STEP section.
Follow those instructions before writing component CSS.

─── WHAT IS ABSOLUTELY FORBIDDEN ───────────────────────────────────────────
✗ Skipping the <thinking> cotejo and writing CSS from statistical intuition
✗ Using a shade marked bg-only / no-text-use as a text color
✗ Outputting CSS while validate_pairings returned proceed: false
✗ Removing or editing inline comments from generate_css_tokens output
✗ Assuming a pairing is safe because it "looked correct" in a prior example
${forbiddenSizeRule}`,
          },
        },
      ],
    }
  }

  throw new Error(`Unknown prompt: ${name}`)
})

// ─── Tools ───────────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, () => ({
  tools: [
    {
      name: 'generate_palette',
      description:
        'Generate the FOUNDATION color scale for a design from any seed hex color: 6 shades (100–900) with every contrast value precomputed, plus a full compatibility matrix. With model "wcag2" (default) the matrix tells you which shade pairs are safe for body text (≥4.5:1) and which are large-text-only (3:1–4.5:1). With model "apca" the matrix is directional (shade AS TEXT on background) and grouped by APCA role: preferredText, bodyText, contentText, largeText, nonText. Technically this scale is monochromatic (one hue, varying lightness) — but that describes the math, not a limit on your palette. Most real interfaces still need 1-2 semantic accent colors (error/success/warning/info, sale/promo badges) on top of this foundation for state communication that a single hue cannot carry; that decision is independent of this tool. If the design calls for an accent, pick a hex for it and validate it with check_contrast (same model) before using it as text or background — this matrix does not cover accent colors.',
      inputSchema: {
        type: 'object',
        properties: {
          hex: {
            type: 'string',
            description: 'A valid hex color, e.g. "#1F7A54" or "1F7A54"',
          },
          theme: {
            type: 'string',
            enum: ['white', 'black'],
            description: 'The background the palette will be used on',
          },
          model: MODEL_PROPERTY,
        },
        required: ['hex', 'theme'],
      },
    },
    {
      name: 'validate_pairings',
      description: `Validate a list of intended color pairings against the palette's compatibility matrix BEFORE writing CSS.

Call this tool in your planning step — before generate_css_tokens — to confirm every combination is accessible. Pass the same model you will use in generate_css_tokens.

model "wcag2" (default) returns level "aa-normal" (≥4.5:1, any size), "aa-large" (3:1–4.5:1, large text only), "fail" (inaccessible), or "invalid" (unknown shade key).

model "apca" treats foreground as TEXT and background as BACKGROUND (direction matters) and returns "preferred-text" (|Lc| ≥ 90), "body-text" (≥ 75), "content-text" (≥ 60, headlines / large text only), "large-text" (≥ 45, very large or bold text, icons), "non-text" (≥ 15, NOT valid as text), "fail", or "invalid". Only the four text levels count as passing.

Also returns a "proceed" field: if proceed is false you are BLOCKED and must fix every failing pair before writing any CSS.

Examples (wcag2):
  ✓ { foreground: "700", background: "white" } → aa-normal, proceed: true
  ⚠ { foreground: "600", background: "100" }  → aa-large,  proceed: true (large text only)
  ✗ { foreground: "100", background: "white" } → fail,      proceed: false — BLOCKED

NOTE: this tool only accepts shade keys (100–900) and "white"/"black" — it does
NOT validate accent colors outside the palette. If your design needs an accent
hex (e.g. a status/brand color not produced by generate_palette), use
check_contrast instead, passing the accent hex against the relevant shade hex
or white/black.`,
      inputSchema: {
        type: 'object',
        properties: {
          hex: {
            type: 'string',
            description: 'Source hex color',
          },
          theme: {
            type: 'string',
            enum: ['white', 'black'],
            description: 'Background theme',
          },
          model: MODEL_PROPERTY,
          pairings: {
            type: 'array',
            description: 'List of shade pairs to validate',
            items: {
              type: 'object',
              properties: {
                foreground: {
                  type: 'string',
                  description: 'Shade key used as text color: 100 | 300 | 600 | 700 | 800 | 900',
                },
                background: {
                  type: 'string',
                  description: 'Shade key or "white"/"black" used as background',
                },
              },
              required: ['foreground', 'background'],
            },
          },
        },
        required: ['hex', 'theme', 'pairings'],
      },
    },
    {
      name: 'generate_css_tokens',
      description: `Generate a complete CSS block for an accessible palette (WCAG 2.2 AA by default, or APCA with model "apca").

REQUIRES validate_pairings to have already passed (proceed: true) for this exact hex+theme+model in this session — call it first or this tool will reject the request.

The output has two parts — both are REQUIRED and must be copied verbatim:

1. A manifest block comment listing every valid pairing by category.
   wcag2: BODY TEXT (≥4.5:1) · LARGE TEXT ONLY (3:1–4.5:1) · BACKGROUND ONLY
   apca:  PREFERRED BODY TEXT (Lc ≥ 90) · BODY TEXT (75–90) · CONTENT TEXT ONLY (60–75) ·
          LARGE TEXT & ICONS ONLY (45–60) · NON-TEXT ONLY (15–45) · NO SAFE TEXT USE
   APCA lines read "shade AS TEXT → backgrounds" and are NOT valid with roles swapped.

2. A :root { } block with one variable per shade and an inline comment:
   • ✅ text→white·100 / ✅ body→white·100   this shade passes as body text on white and shade-100
   • ⚠️ lg→300                              large text only on shade-300
   • ◐ content→300 (apca)                   headlines / large text only on shade-300
   • ▫ non-text→600 (apca)                  borders/dividers only on shade-600 — never text
   • bg-only / no-text-use                  this shade has zero safe text uses

WRONG: ignoring the comments and using shade-100 as a text color
CORRECT: reading "/* bg-only */" and using shade-100 only as a background

Do not remove, rename, or rewrite the comments — they are the authoritative accessibility rules.

ACCENT COLORS: this tool only emits variables for the foundation shades.
If the component CSS you are about to write also needs an accent color (a
hex NOT in this palette — e.g. a status/success/error color), call
check_contrast({ foreground: accentHex, background: shadeHexOrWhiteOrBlack, model })
for every pairing that involves that accent BEFORE using it as text or on a
background. Do not assume an accent is accessible just because it "looks"
dark or light enough.`,
      inputSchema: {
        type: 'object',
        properties: {
          hex: {
            type: 'string',
            description: 'A valid hex color',
          },
          theme: {
            type: 'string',
            enum: ['white', 'black'],
            description: 'The background the palette will be used on',
          },
          model: MODEL_PROPERTY,
          prefix: {
            type: 'string',
            description: 'CSS variable prefix (default: "color")',
          },
        },
        required: ['hex', 'theme'],
      },
    },
    {
      name: 'check_contrast',
      description: `Check the contrast between any two hex colors — independent of any generated palette. model "wcag2" (default) returns the WCAG 2.2 ratio; model "apca" returns the signed APCA Lc value, treating foreground as TEXT and background as BACKGROUND (swapping them changes the result).

Use this to validate an accent color (a hex that is NOT part of the foundation palette) against a known background: white, black, or the hex of a specific palette shade you already have (e.g. from generate_palette or validate_pairings output).

This does NOT generate or modify a palette and does NOT require validate_pairings to have run first. It is a free-standing contrast lookup.

DO NOT use this as a substitute for validate_pairings + generate_css_tokens when checking foundation shades (the 100–900 hex values from generate_palette). It is correct math for the single pair you give it, but it does not gate generate_css_tokens and its result does not get embedded as a manifest comment anywhere — if you verify foundation shades here instead of through validate_pairings, the work is invisible to anyone (model or human) who edits this CSS later, and nothing forces you to have checked every pairing you actually used, only the ones you remembered to call this on. Use check_contrast for true external accents (a hex not in the palette); use validate_pairings → generate_css_tokens for foundation shades, even if validate_pairings just failed on you — fix the input format and retry it, don't route around it.

wcag2 returns ratio (raw float), level ("aa-normal" ≥4.5:1 any size, "aa-large" 3:1–4.5:1 large text only ≥24px or ≥18.67px bold, "fail" below 3:1), and a human-readable message.
apca returns lc (signed float), polarity ("dark-on-light" | "light-on-dark"), level ("preferred-text" | "body-text" | "content-text" | "large-text" | "non-text" | "fail"), and a message.

Examples (wcag2):
  ✓ { foreground: "#0a5", background: "#ffffff" } → aa-normal
  ⚠ { foreground: "#f80", background: "#1a1a1a" } → aa-large
  ✗ { foreground: "#ccc", background: "#ffffff" } → fail`,
      inputSchema: {
        type: 'object',
        properties: {
          foreground: {
            type: 'string',
            description: 'Text/foreground hex color, e.g. "#FF5733" or "FF5733"',
          },
          background: {
            type: 'string',
            description: 'Background hex color the foreground will sit on',
          },
          model: MODEL_PROPERTY,
        },
        required: ['foreground', 'background'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, (request) => {
  const { name, arguments: args } = request.params

  if (!args || typeof args !== 'object') {
    throw new Error('Missing arguments')
  }

  if (name === 'generate_palette') {
    const { hex, theme } = parseHexTheme(args)
    const model = parseModel(args['model'])

    const result = model === 'apca' ? generateApcaPalette(hex, theme) : generatePalette(hex, theme)

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    }
  }

  if (name === 'validate_pairings') {
    const { hex, theme } = parseHexTheme(args)
    const model = parseModel(args['model'])
    const pairings = args['pairings']

    if (!Array.isArray(pairings)) {
      throw new Error('Invalid arguments: pairings must be an array')
    }

    const normalized = pairings.map((p: Record<string, unknown>) => ({
      foreground: String(p['foreground'] ?? ''),
      background: String(p['background'] ?? ''),
    }))

    const report =
      model === 'apca'
        ? validateApcaPairings(generateApcaPalette(hex, theme), normalized)
        : validatePairings(generatePalette(hex, theme), normalized)

    if (report.allPass) {
      sessionGate.markValidated(hex, theme, model)
    }

    const response = {
      ...report,
      model,
      proceed: report.allPass,
      instruction: report.allPass
        ? '✓ All pairings validated. proceed: true — you may now write component CSS.'
        : '✗ BLOCKED: proceed: false — fix every failing pairing and call validate_pairings again. Do NOT output CSS until proceed is true.',
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
    }
  }

  if (name === 'check_contrast') {
    const foreground = args['foreground']
    const background = args['background']
    const model = parseModel(args['model'])

    if (typeof foreground !== 'string' || typeof background !== 'string') {
      throw new Error('Invalid arguments: foreground and background must be hex color strings')
    }

    const result =
      model === 'apca' ? checkApcaContrast(foreground, background) : checkContrast(foreground, background)

    return {
      content: [{ type: 'text', text: JSON.stringify({ model, ...result }, null, 2) }],
    }
  }

  if (name === 'generate_css_tokens') {
    const { hex, theme } = parseHexTheme(args)
    const model = parseModel(args['model'])
    const prefix = args['prefix']
    const modelArg = model === 'apca' ? `, model: "apca"` : ''

    if (!sessionGate.isValidated(hex, theme, model)) {
      throw new Error(
        `BLOCKED: generate_css_tokens requires validate_pairings to pass first for hex="${hex}" theme="${theme}" model="${model}". ` +
          `Call validate_pairings({ hex: "${hex}", theme: "${theme}"${modelArg}, pairings: [...] }) and get proceed: true before retrying.`,
      )
    }

    const cssPrefix = typeof prefix === 'string' ? prefix : undefined
    const tokens =
      model === 'apca'
        ? toApcaCSSTokens(generateApcaPalette(hex, theme), cssPrefix)
        : toCSSTokens(generatePalette(hex, theme), cssPrefix)

    const copyWarning = [
      '⚠️ COPY THE BLOCK BELOW VERBATIM, COMMENTS INCLUDED. Do not "clean up", reformat,',
      'or strip the comments when you paste this into a CSS file — each comment is the only',
      'record of which pairings are accessible. A file with the right hex values and no',
      'comments is no safer than no manifest at all for whoever edits this CSS next,',
      'including you, later in this same task.',
    ].join(' ')

    const nextStep = [
      '─── NEXT REQUIRED STEP ─────────────────────────────────────────────────',
      'Before writing ANY component CSS that references these variables:',
      '',
      '1. Open a <thinking> block and list every (foreground-shade, background) pair you plan to use.',
      '2. Call validate_pairings to confirm ALL of them.',
      '3. Check the response: if proceed is false → STOP, fix every failing pair, repeat from step 2.',
      '4. Only write component CSS after validate_pairings returns proceed: true.',
      '',
      `Template: validate_pairings({ hex: "${hex}", theme: "${theme}"${modelArg}, pairings: [`,
      '  { foreground: "700", background: "white" },  // ← replace with your actual pairs',
      ']})',
      '',
      ...(model === 'apca'
        ? [
            'APCA REMINDER: every pairing is directional. "700 on 100" and "100 on 700" are',
            'two different pairings with two different Lc values. Validate both if you use both.',
            '',
          ]
        : []),
      'Before moving on, ask yourself this explicitly — most real interfaces need',
      'an answer here even when nobody asked for one: does this design have any',
      'state this foundation scale cannot express semantically — an error, a sale/',
      'promo badge, a success toast, a low-stock warning? A single hue at varying',
      'lightness is accessible but semantically silent; a green "error" reads as fine to',
      'a user even when it is not. If the answer is yes, pick an accent hex and',
      'validate it with check_contrast for every pairing it touches BEFORE writing',
      'that component — do not default to skipping it just because nobody required',
      'an accent explicitly.',
      '',
      'If you do add an accent color NOT in this palette, validate_pairings cannot',
      'check it — it only knows shade keys and white/black. Call',
      `check_contrast({ foreground: accentHex, background: ...${modelArg} }) for every pairing`,
      'involving that accent before using it in CSS.',
    ].join('\n')

    return {
      content: [
        { type: 'text', text: copyWarning },
        { type: 'text', text: tokens },
        { type: 'text', text: nextStep },
      ],
    }
  }

  throw new Error(`Unknown tool: ${name}`)
})

const transport = new StdioServerTransport()
await server.connect(transport)
