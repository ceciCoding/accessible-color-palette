# AGENTS.md

Guidelines for AI agents working on this codebase.

---

## What this library does

Takes a hex color + a background theme (`'white'` | `'black'`) and generates a 6-shade monochromatic palette where every shade meets WCAG 2.2 AA contrast requirements. Returns the palette (with hex, RGB and HSL for each shade) plus a usage map describing which shade pairs are safe to combine and at what text size.

A second, parallel pipeline does the same under **APCA** (the WCAG 3 draft model). It has its own derivation chain, its own thresholds and a *directional* usage map. The two pipelines share `math/color.ts`, the lightness walker and `toShadeEntry`, nothing else. See [The APCA algorithm](#the-apca-algorithm).

---

## Non-negotiable constraints

Read these before touching any file.

- **No classes.** No `class`, no `new`, no `this`. Every module is a collection of pure functions.
- **No mutation.** Never reassign an object or array. Always return new values.
- **No external color libraries.** chroma-js, tinycolor2, color, etc. are forbidden. The WCAG math is implemented directly in `src/math/`.
- **Strict TypeScript.** `strict: true` in tsconfig. No `any`. No `as X` type assertions except where the spec explicitly permits them (`parseHex` return value).
- **Single responsibility.** If you need "and" to describe a function, split it.
- **Pure functions everywhere** except `src/mcp/server.ts`, which is the only file allowed to have side effects or import from Node.js core.

---

## Architecture

```
src/math/            -- color conversions + WCAG 2 contrast math + APCA math (no domain logic)
src/algorithm/       -- WCAG 2 shade derivation (depends on math, nothing else)
src/algorithm/apca/  -- APCA shade derivation (depends on math + algorithm/primitives + shade-entry)
src/output/          -- formatting and usage computation (depends on types, nothing else)
src/index.ts         -- public API boundary (the only place that accepts raw string for hex)
src/mcp/server.ts    -- MCP server (depends on index.ts only)
```

Dependencies only flow downward. `algorithm` may import from `math`. Nothing imports from `mcp`. Nothing imports from `index.ts` except external consumers.

---

## The branded HexColor type

`HexColor` is a branded string type defined in `src/types.ts`. It exists to prevent raw strings from bypassing validation.

- The only place a raw `string` is accepted is `generatePalette` / `generateApcaPalette` (and the `check*Contrast` helpers) in `src/index.ts`.
- `parseHex(input: string): HexColor` is the sole gate. It validates and brands.
- All internal functions take `HexColor`, never `string`.
- Do not cast `string` to `HexColor` anywhere except inside `parseHex`.

---

## The algorithm

### find700 — the anchor

700 is the starting point. The algorithm adjusts the input color until its contrast against the background is exactly 5.1:1.

```
if ratio == 5.1  → return as-is
if ratio < 5.1   → increase contrast (darken for white bg, lighten for black bg)
if ratio > 5.1   → decrease contrast (lighten for white bg, darken for black bg)
```

The decrease path uses `retreatLightness` (not `stepTowardRatio`, which only increases ratio). It tracks `prev` to handle overshoot: if the walk crosses below 5.1, return the last value that was still >= 5.1.

### The walker

`src/algorithm/primitives.ts` owns two metric-agnostic walkers: `walkLightness` (increase until `measure(candidate) >= target`) and `retreatLightness` (decrease, return last value still `>= target`). `stepTowardRatio` is a thin wrapper that injects the WCAG 2 ratio as the measure. The APCA chain injects `|Lc|`. Do not write a third loop — plug a measure into these.

### find100, find300, find900

All start from shade700 and walk lightness until the contrast between the new color and shade700 reaches the target:

| Shade | Target vs 700 | Direction (white) |
|-------|---------------|-------------------|
| 100 | 4.5:1 | lighten |
| 300 | 3.1:1 | lighten |
| 900 | 3.1:1 | darken |

### find600, find800

These continue the chain from shade100:

| Shade | Reference | Target | Direction (white) |
|-------|-----------|--------|-------------------|
| 600 | shade100 | 3.1:1 vs 100 | darken |
| 800 | shade600 | 3.1:1 vs 600 | darken |

### buildPalette

Pure sequencing — no logic. If you feel the urge to add an `if` here, it belongs in one of the `find*` functions.

Each shade entry includes `hex`, `rgb` (0–255 integers), and `hsl` (h: 0–360, s/l: 0–100 integers). No contrast values — those live in the usage map.

### buildCompatibilityMatrix

Internal function. Computes `contrastRatioHex` for all 30 ordered pairs of distinct shades. Result is consumed by `buildPaletteUsage` and never exposed in `PaletteResult`. `matrix[shade][shade]` is always `undefined` — never assign it.

### buildPaletteUsage

Converts the internal compatibility matrix into the public usage map. For each shade:
- `normalText`: pairs with ratio >= 4.5 (passes for body text)
- `largeText`: pairs with 3.0 <= ratio < 4.5 (passes for large text / UI components only)
- Failing pairs (ratio < 3.0) are omitted — if it's not in the map, it's not safe to use
- Includes the theme background (`key: 'background'`, hex: `#ffffff` or `#000000`) in whichever list it qualifies for

---

## The APCA algorithm

Lives in `src/algorithm/apca/`. Everything below reads "X on Y" as **X is the text, Y is the background**. In APCA that distinction is not cosmetic: `Lc(a, b) !== -Lc(b, a)`.

### Three facts that shape the code

1. **Signed.** Positive = dark text on light bg, negative = light text on dark bg. Every black-theme value is negative. Targets compare `Math.abs(lc)`; the sign is exposed as polarity, never thrown away.
2. **Directional.** The walker must know whether the moving color is the text or the background. That is why `apca/primitives.ts` has two helpers, `moveTextToLc` and `moveBackgroundToLc`, instead of one.
3. **Compressed dark end.** With 700 at `|Lc| 75` on the theme bg and 100 at `|Lc| 60`, the maximum contrast any color can reach **on 100** is about `Lc 91`, for every hue. "Lc 90 on 100" is therefore pure black. Dark-on-dark pairs clip to `Lc 0` (APCA's `loClip`), so you cannot use APCA to keep 800 and 900 apart either. This is the reason 900 is measured against the theme background.

### Chain

```
inputHex --> find700 --> shade700 --> find100 --> shade100 --> find300 --> shade300
                                                        |----> find600 --> shade600
                                                        |----> find800 --> shade800 --> find900 --> shade900
```

| Shade | Moving role | Fixed reference | Target `\|Lc\|` | Direction (white) |
|-------|-------------|-----------------|----------------|-------------------|
| 700 | text | theme bg | 75 (`LC_ANCHOR_700`) | toward 75 in either direction (`retreatLightness` when too high) |
| 100 | **background** | 700 as text | 60 | lighten |
| 300 | text | 100 | 15 | darken |
| 600 | text | 100 | 45 | darken |
| 800 | text | 100 | 75 | darken |
| 900 | text | theme bg, starting at 800 | 100 (`LC_TARGET_900`) | darken |

`buildApcaPalette` is pure sequencing, same rule as `buildPalette`.

### Thresholds

`src/algorithm/apca/thresholds.ts`: `LC_PREFERRED_TEXT 90`, `LC_BODY_TEXT 75`, `LC_CONTENT_TEXT 60`, `LC_LARGE_TEXT 45`, `LC_NON_TEXT 15`. No epsilon: every APCA tool runs the same reference implementation, so there is no cross-tool drift to absorb. `classifyLc(lc)` returns the highest `ApcaLevel` the magnitude qualifies for; `isTextLevel` is the single source of truth for "counts as text".

These are the simplified APCA levels. Real APCA conformance is a font-size × weight table. The library promises the role minimum and says so in every message. Never claim more.

### buildApcaMatrix / buildApcaUsage

`matrix[text][background]` for all 42 ordered pairs including `theme`. Values differ in both directions — never symmetrise. `buildApcaUsage` turns it into `usage[shade]` = that shade **as text**, each background in its highest bucket only (`preferredText` … `nonText`), `fail` omitted. There is deliberately no "as background" mirror: it would duplicate the matrix and invite reading it symmetrically.

### APCA formula

Implemented in `src/math/apca.ts` — APCA-W3 0.1.9, constants `0.0.98G-4g`. Tests pin it to the eight official `apca-w3` reference values to `1e-9`. The APCA `Y` uses a plain `2.4` power curve and its own coefficients; it is **not** the WCAG 2 relative luminance. Never feed one into the other.

---

## WCAG contrast formula

Exact formulas, no approximations. Implemented in `src/math/contrast.ts`.

```
toLinear(c):
  c <= 0.04045  →  c / 12.92
  else          →  ((c + 0.055) / 1.055) ^ 2.4

relativeLuminance(rgb):
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)

contrastRatio(a, b):
  L1 = max(luminance(a), luminance(b))
  L2 = min(luminance(a), luminance(b))
  ratio = (L1 + 0.05) / (L2 + 0.05)
  round: Math.round(ratio * 100) / 100   ← NOT Number.toFixed, NOT Math.round on intermediates
```

Never round intermediate luminance values. Only round the final ratio.

---

## What NOT to do

These mistakes are common when working with color code. Do not repeat them.

- **Do not use HSL lightness as a proxy for contrast.** `l` and luminance are different things. Always use `contrastRatioHex` or `apcaContrastHex`.
- **Do not treat APCA as symmetric.** `usage[a]` lists `a` as text. If you need `b` as text on `a`, look at `usage[b]`.
- **Do not drop the Lc sign** before it reaches the output. Compare `Math.abs` against targets, expose the signed value.
- **Do not name anything `wcag3`.** WCAG 3 is a draft; the model is `apca`.
- **Do not use `Number.toFixed`.** It returns a string. Use `Math.round(ratio * 100) / 100`.
- **Do not expose internal functions from `src/index.ts`.** The public API is exactly `generatePalette`, `toCSSTokens`, `validatePairings`, `checkContrast` and their four `Apca` counterparts.
- **Do not add caching or memoization** unless profiling proves it is needed.
- **Do not silently clamp invalid hex inputs.** Throw with `Error('Invalid hex color: <input>')`.
- **Do not add `if` logic to `buildPalette`.** It is a pure sequencing function.
- **Do not import any color library** at any point.
- **Do not put contrast values on `ShadeEntry`.** Contrast information belongs in `usage`, not in `palette`.

---

## Testing

Framework: **Vitest**. Run with `vitest run`. Target: 100% coverage of `src/` excluding `src/mcp/server.ts`.

```
tests/math/                -- unit tests for color conversions, WCAG 2 math and APCA math (official reference values)
tests/algorithm/           -- unit tests for each find* function in isolation
tests/algorithm/apca/      -- same for the APCA chain, matrix and thresholds
tests/output/              -- unit tests for tokens, usage and validation (both models)
tests/integration.test.ts  -- end-to-end with known hex/palette pairs from the Figma test cases
tests/apca-integration.test.ts
```

Integration tests use fixed expected values (see `README.md` — Example output section). Allow ±1 per hex channel to account for the 0.5% lightness step.

When adding a new shade derivation rule, test the `find*` function directly — do not rely only on `buildPalette` tests to cover it.

---

## File ownership

| File | What lives here | What does NOT belong here |
|------|----------------|--------------------------|
| `src/types.ts` | All types and branded primitives | No logic |
| `src/math/color.ts` | Conversion functions only | No contrast math, no domain logic |
| `src/math/contrast.ts` | WCAG luminance + ratio | No color conversions |
| `src/math/apca.ts` | APCA Y, soft clamp, signed Lc, polarity | No WCAG 2 math, no thresholds |
| `src/algorithm/primitives.ts` | `walkLightness`, `retreatLightness`, `stepTowardRatio` and its two wrappers | No shade-specific logic, no APCA |
| `src/algorithm/shade-entry.ts` | `toShadeEntry` (hex → public entry shape) | No derivation |
| `src/algorithm/palette.ts` | One `find*` function per shade + `buildPalette` | No formatting, no compatibility |
| `src/algorithm/compatibility.ts` | `buildCompatibilityMatrix` only (internal) | No palette building |
| `src/algorithm/apca/thresholds.ts` | Lc levels, shade targets, `classifyLc`, `isTextLevel` | No walking |
| `src/algorithm/apca/primitives.ts` | `moveTextToLc`, `moveBackgroundToLc` | No shade-specific logic |
| `src/algorithm/apca/palette.ts` | APCA `find*` per shade + `buildApcaPalette` | No formatting, no compatibility |
| `src/algorithm/apca/compatibility.ts` | `buildApcaMatrix` only (internal) | No palette building |
| `src/output/tokens.ts` | `toCSSTokens` only | No palette building |
| `src/output/usage.ts` | `buildPaletteUsage` only | No palette building |
| `src/output/apca-tokens.ts` | `toApcaCSSTokens`, `buildApcaCompatMatrix` | No palette building |
| `src/output/apca-usage.ts` | `buildApcaUsage` only | No palette building |
| `src/output/apca-validation.ts` | `validateApcaPairings`, `checkApcaContrast` | No palette building |
| `src/index.ts` | `generatePalette`, `generateApcaPalette`, re-exports, type exports | No implementation logic |
| `src/mcp/server.ts` | MCP wiring, `model` dispatch | No algorithm reimplementation |
