# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [2.4.0] — 2026-11-16

### Added

- **RGB and HSL input** — `generatePalette` and `checkContrast` now accept `rgb(r, g, b)` / `hsl(h, s%, l%)` strings (comma or space separated) and `{ r, g, b }` (0–255) / `{ h, s, l }` (h 0–360, s/l 0–100) objects, in addition to hex. The object shapes match `ShadeEntry.rgb` / `.hsl`, so library output can be fed back in. New exported types: `ColorInput`, `RGBInput`, `HSLInput`.
- **`InvalidColorError`** — exported class (`extends Error`) now thrown by `generatePalette` and `checkContrast` for any invalid color input. Fields: `format: 'hex' | 'rgb' | 'hsl' | 'unknown'`, `input: string` (the offending input, JSON-serialized for objects) and `message`. Also exports the `InvalidColorFormat` type. Consumers can use `instanceof InvalidColorError` instead of matching on message text.
- The CLI and the MCP tools (`generate_palette`, `validate_pairings`, `generate_css_tokens`, `check_contrast`) accept `rgb()` / `hsl()` strings too.

### Changed

- The MCP session gate now keys on the normalized hex, so `validate_pairings` with `"#1F7A54"` unlocks `generate_css_tokens` for `"rgb(31, 122, 84)"` (and for `"1f7a54"`, which previously didn't match `"#1f7a54"`).

### Notes

- Backwards compatible: every previously valid hex input behaves identically, return types are unchanged, and `InvalidColorError` is still an `Error`, so existing `catch` blocks keep working. `parseColor` stays internal.
- Error messages keep their `Invalid hex color: <input>` prefix, but now append an `Accepts …` hint listing the valid formats. Code that matches on the full message text should match the prefix (or use `instanceof InvalidColorError`).
- Out-of-range rgb/hsl values throw `Invalid rgb color: …` / `Invalid hsl color: …`; they are never clamped.
- Hex strings are now trimmed (`" #FFF "` is valid), consistent with `rgb()` / `hsl()` strings.
- Color strings longer than 64 characters are rejected up front with `InvalidColorError`, and the `rgb()` / `hsl()` separator pattern is unambiguous, so hostile input cannot trigger catastrophic regex backtracking.
- Unserializable inputs (circular objects, `BigInt` channels) throw `InvalidColorError` like any other invalid color, never a raw `TypeError`.
- The `palette://{hex}/{theme}` resource is still hex-only.

---

## [2.3.0] — 2026-06-25

### Added

- **`check_contrast` tool/function** — standalone WCAG 2.2 contrast check between any two hex colors, independent of any generated palette. For accent/status/brand colors that aren't part of the foundation scale and that `validate_pairings` can't check (it only knows shade keys and white/black).
- **Library exports** — `validatePairings` and `checkContrast` are now exported from the package's entry point (`src/index.ts`), along with their types (`PairingLevel`, `PairingResult`, `ValidationReport`, `ContrastCheckResult`). Both were already pure, tested functions but weren't reachable without going through the MCP server.

### Changed

- `generate_palette`, the palette resource, and `validate_pairings`/`generate_css_tokens` descriptions now frame the 100–900 scale as a **foundation layer**, not the whole palette — clarifying that "monochromatic" describes the math, not a limit on the rest of the UI, and pointing to `check_contrast` for accent colors.
- `generate_css_tokens` now returns an explicit verbatim-copy warning as the first content block, immediately before the CSS tokens — some models were stripping the inline WCAG comments when copying the output into a file, keeping only the hex values.
- The WCAG manifest and the `plan-palette-usage` prompt's forbidden list now state explicitly that there is no "decorative" or "non-critical" text exemption from contrast requirements — a model was observed computing that a pairing failed and then using it anyway by inventing this exception.
- `generate_css_tokens`' next-step instructions now ask the model to explicitly consider whether the design needs semantic accent colors (error/success/warning/sale) before defaulting to the foundation scale alone.

### Fixed

- `check_contrast`'s description now explicitly forbids using it as a substitute for `validate_pairings` + `generate_css_tokens` when checking foundation shades — an agent was observed routing around a `validate_pairings` format error this way, bypassing the session gate and the manifest entirely.

### Docs

- Moved the "As an MCP server" section out of README.md into its own [MCP.md](./MCP.md) — the README was getting long for a section most library-only consumers don't need; MCP.md is published alongside it so the link still resolves on the npm page.
- Package no longer ships `dist/**/*.map` — source maps for the package's own TypeScript aren't useful to consumers and were ~36% of the unpacked package size.

---

## [2.2.0] — 2026-06-21

### Added

- **MCP server enforcement** — `generate_css_tokens` now rejects requests for a given hex+theme until `validate_pairings` has returned `proceed: true` for that same hex+theme earlier in the session. This makes the validate-before-generate rule a protocol-level contract instead of a prompt-only suggestion, so it holds regardless of whether the client supports MCP prompts.

### Changed

- `plan-palette-usage` prompt — Step 3 now notes that the validate-before-generate ordering is enforced server-side, not just advisory.

---

## [2.1.0] — 2026-06-15

### Added

- **CLI** — `accessible-color-palette <hex> <theme>` now works as a standalone command via `npx` or global install. Outputs the annotated `:root {}` block with the WCAG pairing manifest by default. Supports `--prefix <name>` for custom CSS variable names and `--json` for raw JSON output.

---

## [2.0.1] — 2026-05-14

### Changed

- Updated README with npm install instructions, migration notes from v1, and MCP server setup docs.

---

## [2.0.0] — 2026-05-14

Full rewrite. Not compatible with v1.

### Added

- `generatePalette(hex, theme)` — pure function that derives 6 accessible shades (100, 300, 600, 700, 800, 900) from any hex color against a white or black background.
- `toCSSTokens(result, prefix?)` — generates a `:root {}` block with inline WCAG comments and a pairing manifest.
- Palette usage map — for each shade, lists which other shades pass AA for body text (≥4.5:1) and large text only (3:1–4.49:1).
- MCP server — exposes `generate_palette`, `validate_pairings`, and `generate_css_tokens` as tools; palette compatibility matrix as a resource template; `plan-palette-usage` prompt for guided agentic workflows.
- WCAG 2.2 contrast formula implemented directly — no external color libraries.
- Branded `HexColor` type — prevents raw strings from leaking through the public API.
- Full test suite with Vitest, including integration tests validated against known Figma outputs.

### Changed

- API is entirely different from v1. See [migration notes in the README](./README.md#migrating-from-v1).

### Removed

- Class-based API (`AccessibleColorPalette.generatePalette(...)`).
- External dependencies: `colorsys`, `@mdhnpm/color-contrast-ratio-calculator`.

---

## [1.x]

Source code for v1 is no longer available. The package remains on npm as `accessible-color-palette@1.x` but is not maintained.
