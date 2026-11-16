# The APCA variant

This document explains the APCA (WCAG 3 draft) variant of the palette generator: what APCA changes compared to WCAG 2, how the shade chain was adapted, why the 900 shade is not derived the way the original spec asked, and what the library does and does not promise. Everything numeric here was produced by the code in this repository, not estimated.

---

## 1. What APCA is

[APCA](https://github.com/Myndex/apca-w3) (Accessible Perceptual Contrast Algorithm) is the contrast model proposed for WCAG 3. Instead of a ratio (`4.5:1`), it outputs a **lightness contrast** value, `Lc`, roughly from `-108` to `+106`.

WCAG 3 is still a Working Draft and APCA is not normative anywhere yet. That is why everything in the public API is called `apca`, never `wcag3`.

The library implements **APCA-W3 0.1.9** (constant set `0.0.98G-4g`) directly in `src/math/apca.ts`, with no external library, and pins it to the eight official reference values shipped with `apca-w3`:

| Text | Background | Lc |
|------|------------|----|
| `#888` | `#fff` | `63.056` |
| `#fff` | `#888` | `-68.541` |
| `#000` | `#aaa` | `58.146` |
| `#aaa` | `#000` | `-56.241` |
| `#123` | `#def` | `91.668` |
| `#def` | `#123` | `-93.068` |
| `#123` | `#444` | `8.323` |
| `#444` | `#123` | `-7.527` |

The tests assert these to `1e-9`.

---

## 2. Three things that change versus WCAG 2

### 2.1 Values are signed

Dark text on a light background gives a **positive** `Lc`. Light text on a dark background gives a **negative** one.

| Pair | WCAG 2 | APCA |
|------|--------|------|
| black on white | `21:1` | `Lc +106.0` |
| white on black | `21:1` | `Lc -107.9` |

So on the `black` theme every value in the palette is negative. The algorithm compares `|Lc|` against its targets and keeps the sign in the output as **polarity** (`dark-on-light` / `light-on-dark`).

### 2.2 Values are directional

This is the part that actually changes the code. In WCAG 2, contrast is symmetric: `ratio(a, b) === ratio(b, a)`. In APCA it is not, and it is not just the sign:

```
Lc(#888 on #fff) =  63.1
Lc(#fff on #888) = -68.5     ← 5 points apart in magnitude
```

The exponents applied to text and background differ (`0.57 / 0.56` for dark-on-light, `0.62 / 0.65` for light-on-dark), so **text and background are roles, not interchangeable slots**.

Consequences:

- The compatibility matrix is `matrix[text][background]`, all 42 ordered pairs, and `matrix[a][b]` is genuinely different from `matrix[b][a]`.
- The usage map describes each shade **as text**: `usage['700']` lists the backgrounds 700 can sit on *as text*. If you want 100 as text on 700, you read `usage['100']`, not the reverse of `usage['700']`.
- The lightness walker needs to know which role the moving color plays. Deriving 100 from 700 moves the **background** (700 is the fixed text). Deriving 300/600/800 from 100 moves the **text** (100 is the fixed background).

### 2.3 Levels are roles, not ratios

APCA does not have "4.5 for normal text, 3.0 for large". It has a set of `Lc` levels tied to roles. The library uses the simplified ("bronze") levels:

| Level | `\|Lc\|` | Role |
|-------|----------|------|
| `preferred-text` | `≥ 90` | preferred for body text |
| `body-text` | `≥ 75` | minimum for body text |
| `content-text` | `≥ 60` | minimum for content text: headlines, large text |
| `large-text` | `≥ 45` | very large or bold text, icons, UI strokes |
| `non-text` | `≥ 15` | borders, dividers, decorative. Never text |
| `fail` | `< 15` | nothing |

Each text/background pair lands in its **highest** qualifying level only.

What the library does **not** do: full APCA conformance is a font-size × font-weight lookup table (a given `Lc` allows a given minimum size per weight). A palette cannot know the font. The library guarantees the role minimum and says so in every message; applying the size table is the consumer's job.

There is no epsilon on these thresholds, unlike the WCAG 2 ones (`4.6` instead of `4.5`). The WCAG epsilon exists because audit tools disagree at the second decimal. Every APCA tool runs the same reference implementation, so there is nothing to defend against.

---

## 3. The chain

Reading convention for the whole document: **"X on Y" means X is the text and Y is the background.**

The designer's original spec:

```
100 — ≥ Lc 60 (700 on 100)        content text minimum
300 — Lc 15 (300 on 100)          non-text minimum
600 — Lc 45 (600 on 100)          large text and icons
700 — Lc 75 (700 on theme bg)     body text minimum   ← anchor
800 — Lc 75 (800 on 100)          body text minimum
900 — Lc 90 (900 on 100)          preferred body text  ← see section 4
```

What was implemented:

```
inputHex → find700 → 700 → find100 → 100 → find300 → 300
                                     ├──→ find600 → 600
                                     └──→ find800 → 800 → find900 → 900
```

| Shade | Moving role | Fixed reference | Target `\|Lc\|` | Direction on white | Direction on black |
|-------|-------------|-----------------|----------------|--------------------|--------------------|
| 700 | text | theme background | `≥ 75` | darken if too light, lighten if too dark | mirrored |
| 100 | **background** | 700 as text | `≥ 60` | lighten | darken |
| 300 | text | 100 | `≥ 15` | darken | lighten |
| 600 | text | 100 | `≥ 45` | darken | lighten |
| 800 | text | 100 | `≥ 75` | darken | lighten |
| 900 | text | **theme background**, starting from 800 | `≥ 100` | darken | lighten |

All shades except 900 follow the spec exactly. The mechanism is the same as the WCAG 2 chain: walk HSL lightness in `0.5%` steps and stop at the first value that reaches the target. Because of the step, every target is "at least", never "exactly" (700 lands at `75.1`–`75.7`, never `75.0`).

`find700` adjusts in both directions. If the input already has too much contrast it walks *toward* the background and keeps the last value still `≥ 75`, so an overshoot never leaks out.

---

## 4. Why 900 is not "Lc 90 on 100"

This is the one deviation from the spec, and it is forced by the math, not by taste.

### 4.1 The ceiling on the 100 tint

`Lc` depends only on luminance, so once the targets are fixed, the luminance of every shade is fixed regardless of hue:

- 700 at `Lc 75` on white pins its APCA luminance at `Y ≈ 0.134`.
- 100 at `Lc 60` under that 700 pins the tint at `Y ≈ 0.78`.
- The **maximum** `Lc` any color can reach on a `Y ≈ 0.78` background is what pure black gives: `Lc ≈ 91`.

Asking for `Lc 90` on that tint leaves one point of headroom. The walker reaches it, but only at the very bottom of the lightness range. Simulated across six hues on white:

| Input | 700 | 100 | 900 at `Lc 90` on 100 |
|-------|-----|-----|-----------------------|
| `#3b82f6` blue | `#0b61ee` | `#dae7fd` | `#031330` (l = 10%) |
| `#e11d48` red | `#cd1a41` | `#fbdee5` | `#21040b` (l = 7%) |
| `#10b981` green | `#0b7c56` | `#9ff6d9` | `#02120d` (l = 4%) |
| `#f59e0b` amber | `#966106` | `#fce2b6` | `#191001` (l = 5%) |
| `#888888` gray | `#6e6e6e` | `#e6e6e6` | `#161616` (l = 9%) |
| `#7c3aed` violet | `#8243ee` | `#ece2fc` | `#1a063b` (l = 13%) |

On black it mirrors: 900 becomes `#f9fbff`, `#fcfcfc`, `#fffbf4`. The hue is gone. This happens for **every** input, because the ceiling does not depend on hue.

### 4.2 The alternatives that do not work

**"Measure 900 at `Lc 90` on the theme background instead."** The 800 is defined as `Lc 75` on 100, and that lands at `Lc ≈ 90` on white. So 900 at `Lc 90` on white is the 800:

| Input | 800 | 900 at `Lc 90` on white |
|-------|-----|-------------------------|
| `#e11d48` | `#8a112e` | `#8a112e` (identical) |
| `#f59e0b` | `#654104` | `#654104` (identical) |
| `#888888` | `#4a4a4a` | `#4a4a4a` (identical) |
| `#3b82f6` | `#0942a4` | `#0941a1` (one step) |

**"Keep 900 at least `Lc 15` away from 800."** APCA clips any contrast below about `Lc 10` to `0`, and dark-on-dark pairs sit in that zone. `Lc(#063076 on #0942a4)` is exactly `0.0`. So APCA cannot be used to keep two dark shades apart at all. The walker runs to pure black looking for a `15` that never arrives.

**"Make the 100 lighter so the ceiling rises."** Raising the 100 target to `Lc 70` lifts the ceiling to `≈ 96`, but it moves every other shade with it (600 drops to `Lc ≈ 50` on white, 800 to `≈ 83`) and contradicts the `≥ 60` the spec sets for 100.

### 4.3 What was chosen

```
900 = first color, walking from 800 away from the background,
      whose |Lc| on the THEME background is ≥ 100
```

Rationale:

- `100` is preferred-text (`≥ 90`) with margin. Black on white is `106`, so there is still room for hue.
- Starting from 800 guarantees 900 is strictly beyond 800 even in the degenerate case.
- It yields the same 15-point ladder the spec was reaching for, just measured against the page: `700 → 75`, `800 → 90`, `900 → 100`.
- Measured on the 100 tint it comes out at `Lc ≈ 85`, i.e. body text on the tint, five points short of "preferred". That is the trade: hue kept, one role level given up on the tint.

| Input (white) | 900 at `Lc 90` on 100 (spec) | 900 at `Lc 100` on white (chosen) |
|---------------|------------------------------|-----------------------------------|
| `#3b82f6` | `#031330` (l 10%) | `#052863` (l 20%) |
| `#e11d48` | `#21040b` (l 7%) | `#560b1d` (l 19%) |
| `#10b981` | `#02120d` (l 4%) | `#053324` (l 11%) |
| `#f59e0b` | `#191001` (l 5%) | `#402903` (l 13%) |
| `#888888` | `#161616` (l 9%) | `#2e2e2e` (l 18%) |
| `#7c3aed` | `#1a063b` (l 13%) | `#340c75` (l 25%) |

The bigger lesson: APCA compresses the dark end. Between a `Lc 75` anchor and black there is room for exactly one body-text rung. Any six-shade ladder that wants two dark rungs above 700 will hit this.

---

## 5. Example output

`generateApcaPalette('#1F7A54', 'white')`

| Shade | Hex | Lc on white | Lc on 100 | Role on white | Role on 100 |
|-------|-----|-------------|-----------|---------------|-------------|
| 100 | `#c5f0de` | `12.0` | — | fail | — |
| 300 | `#74dbb0` | `29.5` | `15.1` | non-text | non-text |
| 600 | `#2aa16f` | `59.6` | `45.1` | large-text | large-text |
| 700 | `#207c55` | `75.1` | `60.7` | body-text | content-text |
| 800 | `#16543a` | `90.1` | `75.6` | preferred-text | body-text |
| 900 | `#0e3424` | `100.0` | `85.6` | preferred-text | body-text |

`generateApcaPalette('#239062', 'black')`

| Shade | Hex | Lc on black | Lc on 100 |
|-------|-----|-------------|-----------|
| 100 | `#16583c` | `-13.5` | — |
| 300 | `#21855b` | `-30.1` | `-15.5` |
| 600 | `#32c889` | `-60.4` | `-45.8` |
| 700 | `#78deb3` | `-75.1` | `-60.5` |
| 800 | `#baeed8` | `-89.6` | `-75.0` |
| 900 | `#e3f8ef` | `-100.1` | `-85.5` |

Note `800` on black: `-89.6`, just under preferred. The 800 is defined on the 100 tint, not on the page, so its value on the page is a consequence, not a target.

### What directionality buys you

From the manifest for `#1F7A54` on white:

```
BODY TEXT (Lc 75–90):
  shade-100 (#c5f0de) → 900, 800
```

The lightest tint is valid **as light text on the two darkest shades**. Under WCAG 2 the same information exists but is read symmetrically ("100 and 900 pair"). Under APCA the map states which one is the text, and the reverse direction (`900` as text on `100`) is a separate entry with a separate value (`85.6` vs `-90.8`). Nothing is "background only" in a typical palette: every shade is text on something.

---

## 6. Output shape

```ts
interface ApcaPaletteResult {
  model: 'apca'
  palette: Record<ShadeKey, { hex; rgb; hsl }>      // identical to the WCAG 2 result
  usage: Record<ShadeKey, {
    hex: string
    preferredText: ApcaPair[]   // |Lc| ≥ 90
    bodyText:      ApcaPair[]   // |Lc| ≥ 75
    contentText:   ApcaPair[]   // |Lc| ≥ 60
    largeText:     ApcaPair[]   // |Lc| ≥ 45
    nonText:       ApcaPair[]   // |Lc| ≥ 15
  }>
  theme: 'white' | 'black'
  sourceColor: string
}

interface ApcaPair { key: ShadeKey | 'theme'; hex: string; lc: number /* signed */ }
```

- `usage[shade]` = that shade **as text**.
- Each background appears in at most one bucket (its highest).
- Pairs under `|Lc| 15` are omitted.
- There is deliberately no "as background" mirror. It would duplicate the matrix and invite reading it symmetrically.

---

## 7. Using it

**Library**

```ts
import {
  generateApcaPalette, toApcaCSSTokens, validateApcaPairings, checkApcaContrast,
} from 'accessible-color-palette'

const result = generateApcaPalette('#1F7A54', 'white')
toApcaCSSTokens(result, 'brand')                                   // manifest + :root block
validateApcaPairings(result, [{ foreground: '700', background: 'white' }])  // level: 'body-text'
checkApcaContrast('#ffffff', '#000000')                            // lc: -107.9, polarity: 'light-on-dark'
```

`foreground` is always the text. `background` is always the background.

**CLI**

```bash
npx accessible-color-palette 1F7A54 white --model apca
npx accessible-color-palette 1F7A54 white --model apca --json
```

**MCP**

Every tool takes `model: "wcag2" | "apca"` (default `wcag2`). The resource is `palette://{hex}/{theme}/apca`. The `plan-palette-usage` prompt takes `model` as an optional third argument. The gate in `generate_css_tokens` is keyed on hex + theme + model: a WCAG 2 validation does not unlock APCA tokens. See `MCP.md`.

---

## 8. Where the code lives

| File | Responsibility |
|------|----------------|
| `src/math/apca.ts` | APCA luminance, black soft clamp, signed `Lc`, polarity |
| `src/algorithm/primitives.ts` | metric-agnostic walkers `walkLightness` / `retreatLightness`, shared with WCAG 2 |
| `src/algorithm/apca/thresholds.ts` | `Lc` levels, per-shade targets (with the 900 rationale in a comment), `classifyLc`, `isTextLevel` |
| `src/algorithm/apca/primitives.ts` | `moveTextToLc`, `moveBackgroundToLc` (the two roles) |
| `src/algorithm/apca/palette.ts` | one `find*` per shade, `buildApcaPalette` |
| `src/algorithm/apca/compatibility.ts` | `matrix[text][background]`, 42 ordered pairs |
| `src/output/apca-usage.ts` | directional usage map |
| `src/output/apca-tokens.ts` | manifest + CSS variables |
| `src/output/apca-validation.ts` | `validateApcaPairings`, `checkApcaContrast` |

Tests: `tests/math/apca.test.ts` (official values), `tests/algorithm/apca/`, `tests/output/apca-*.test.ts`, `tests/apca-integration.test.ts`.

---

## 9. Open questions for the designer

1. **The 900 trade.** The chosen rule gives up "preferred text on the 100 tint" (`Lc 85` instead of `90`) to keep hue. If pure-black 900 is acceptable for some use (true text-black, borders), the original rule is a one-constant change in `thresholds.ts`.
2. **The 800 on the page.** On black it comes out at `Lc -89.6`, a hair under preferred. If 800 should be preferred text on the page by contract, it has to be anchored on the page instead of on the 100 tint, and then the 900 question reopens.
3. **A `Lc 30` bucket.** APCA has a `30` level for placeholder / disabled text. The library folds `30–45` into `non-text`, which is the conservative reading. Add it only if the design system has that role.
4. **Font-size table.** If the consumer wants the full size × weight lookup, that is a separate layer on top of this library, not a palette concern.
