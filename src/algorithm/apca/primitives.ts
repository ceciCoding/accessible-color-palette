import { apcaContrastHex } from '../../math/apca.js'
import { walkLightness } from '../primitives.js'
import type { Direction, HexColor } from '../../types.js'

// APCA is directional, so the walker must know which role the moving color plays.
// Both helpers compare |Lc| against the target: the sign is polarity, not magnitude.

// Moves `start` until |Lc(moving AS TEXT on `background`)| >= targetLc.
export function moveTextToLc(
  start: HexColor,
  background: HexColor,
  targetLc: number,
  direction: Direction
): HexColor {
  return walkLightness(
    start,
    direction,
    (candidate) => Math.abs(apcaContrastHex(candidate, background)),
    targetLc
  )
}

// Moves `start` until |Lc(`text` on moving AS BACKGROUND)| >= targetLc.
export function moveBackgroundToLc(
  start: HexColor,
  text: HexColor,
  targetLc: number,
  direction: Direction
): HexColor {
  return walkLightness(
    start,
    direction,
    (candidate) => Math.abs(apcaContrastHex(text, candidate)),
    targetLc
  )
}
