import type { ApcaLevel } from '../../types.js'

// APCA (WCAG 3 draft) Lc levels — the simplified "bronze" guidelines.
//
// Full APCA conformance is a font-size × font-weight lookup table. These levels
// are the minimum |Lc| each ROLE needs regardless of font, which is what a
// palette can promise. Anything size-specific is the consumer's job.
//
// No epsilon here, unlike the WCAG 2 thresholds: every APCA tool runs the same
// reference implementation (apca-w3), so there is no cross-tool precision drift
// to defend against.
export const LC_PREFERRED_TEXT = 90 // preferred for body text
export const LC_BODY_TEXT = 75      // minimum for body text
export const LC_CONTENT_TEXT = 60   // minimum for content text: headlines, large text
export const LC_LARGE_TEXT = 45     // minimum for very large / bold text, icons, UI
export const LC_NON_TEXT = 15       // minimum for non-text: borders, dividers

// Shade targets. "X on Y" = X is the TEXT, Y is the BACKGROUND. Direction matters.
export const LC_ANCHOR_700 = LC_BODY_TEXT   // 700 on theme background
export const LC_TARGET_100 = LC_CONTENT_TEXT // 700 on 100
export const LC_TARGET_300 = LC_NON_TEXT     // 300 on 100
export const LC_TARGET_600 = LC_LARGE_TEXT   // 600 on 100
export const LC_TARGET_800 = LC_BODY_TEXT    // 800 on 100

// 900 is NOT measured against 100. With 700 at Lc 75 and 100 at Lc 60, the
// ceiling of any color on 100 is ~Lc 91, so "Lc 90 on 100" is pure black for
// every hue. Instead 900 targets Lc 100 on the theme background: preferred text
// (>= 90) with margin, still carrying hue (black on white is Lc 106).
export const LC_TARGET_900 = 100              // 900 on theme background

export function classifyLc(lc: number): ApcaLevel {
  const magnitude = Math.abs(lc)
  if (magnitude >= LC_PREFERRED_TEXT) return 'preferred-text'
  if (magnitude >= LC_BODY_TEXT) return 'body-text'
  if (magnitude >= LC_CONTENT_TEXT) return 'content-text'
  if (magnitude >= LC_LARGE_TEXT) return 'large-text'
  if (magnitude >= LC_NON_TEXT) return 'non-text'
  return 'fail'
}

const TEXT_LEVELS: ReadonlySet<ApcaLevel> = new Set<ApcaLevel>([
  'preferred-text',
  'body-text',
  'content-text',
  'large-text',
])

export function isTextLevel(level: ApcaLevel): boolean {
  return TEXT_LEVELS.has(level)
}
