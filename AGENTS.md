# AGENTS.md

Takes a hex color + a background theme (`'white'` | `'black'`) and generates a 6-shade monochromatic palette where every shade meets WCAG 2.2 AA. This file lists only what the code and tests cannot tell you: constraints, invariants and gotchas. For structure, read the code.

## Non-negotiable constraints

- **No classes, no mutation.** No `class`, `new`, `this`. Never reassign an object or array; return new values. **Single exception:** `InvalidColorError` in `src/input/errors.ts` (`instanceof` on an Error subtype needs a class). Immutable (`readonly` fields); no other class is allowed.
- **No external color libraries** (chroma-js, tinycolor2, color…). WCAG math lives in `src/math/`.
- **Strict TypeScript.** No `any`. No `as X` except the `parseHex` return value.
- **Single responsibility.** If you need "and" to describe a function, split it.
- **Pure functions everywhere** except `src/mcp/server.ts`, the only file allowed side effects or Node core imports.
- **After any change, run `tsc --noEmit` and `vitest run`.**

## Layers

```
math/       conversions + WCAG contrast. No parsing, no domain logic.
input/      parseHex / parseColor: raw user input -> HexColor. Owns the "accepted formats" error messages.
algorithm/  shade derivation (one find* per shade, buildPalette, buildCompatibilityMatrix, thresholds).
output/     tokens, usage, validation. Takes HexColor only, never raw input. Never imports input/.
index.ts    public boundary: the only place raw input is accepted (via parseColor). No implementation logic.
mcp/        imports from index.ts ONLY. Never from math/, input/, algorithm/ or output/.
```

Dependencies flow downward. `input` and `algorithm` may import `math`; `algorithm` may import `parseHex` for constants. Nothing imports `mcp`. Nothing imports `index.ts` except external consumers.

Public API is exactly `generatePalette`, `toCSSTokens`, `validatePairings`, `checkContrast`, `buildCompatMatrix`, plus the `InvalidColorError` class thrown on invalid input (the JSON shape served by the MCP `palette://` resource). Everything else is internal. Wrapping an internal function in `index.ts` is the only way for `mcp/` to reach it.

## HexColor

Branded string in `src/types.ts`; it exists so raw strings cannot bypass validation.

- `parseHex` is the **only** function that casts `string` to `HexColor`. rgb/hsl reuse `rgbToHex` / `hslToHex`, no new casts.
- Raw `ColorInput` is accepted only by `generatePalette` and `checkContrast`, which call `parseColor` immediately. Everything internal takes `HexColor`.
- Invalid input throws (`Invalid hex|rgb|hsl color: <input>. Accepts …`). **Never clamp silently.**

## Algorithm gotchas

- **700 is the anchor**: adjust the input until contrast vs background is exactly 5.1:1. The decrease path uses a manual loop, not `stepTowardRatio` (which only increases ratio), and tracks `prev`: on overshoot below 5.1, return the last value still >= 5.1.
- **Order matters**: 100/300 derive from 700; 600 from 100; 800 from 600. 900 walks from 700 to `AA_LARGE`, but if the result has less than `AA_NORMAL` against 600 it keeps walking until it does (`find900` takes both 700 and 600).
- **`buildPalette` is pure sequencing.** An `if` there belongs in a `find*` function.
- **`matrix[shade][shade]` is always `undefined`.** Never assign it. The matrix is internal; it never appears in `PaletteResult`.
- **Usage map**: thresholds are `AA_NORMAL` = 4.5 + `EPSILON` (4.60) and `AA_LARGE` = 3.0 + `EPSILON` (3.10), see `algorithm/thresholds.ts`; user-facing language still says 4.5 / 3.0. `normalText` is ratio >= `AA_NORMAL`, `largeText` is `AA_LARGE` <= ratio < `AA_NORMAL`. Failing pairs are omitted: absent means not safe. The theme background appears as `key: 'theme'`.
- **No contrast values on `ShadeEntry`.** They belong in `usage`.

## WCAG contrast

Exact formulas (`src/math/contrast.ts`), no approximations. Round **only** the final ratio, with `Math.round(ratio * 100) / 100`. Never `Number.toFixed` (returns a string), never round intermediate luminance.

## Do not

- Use HSL lightness as a proxy for WCAG contrast. Always use `contrastRatioHex`.
- Add caching or memoization unless profiling proves it is needed.
- Reimplement algorithm logic in `mcp/server.ts`.

## Testing

Vitest. Target: 100% coverage of `src/` excluding `src/mcp/server.ts`. Integration tests use fixed values from the README "Example output" section, with ±1 per hex channel of tolerance. When adding a shade rule, test the `find*` function directly, not only through `buildPalette`.
