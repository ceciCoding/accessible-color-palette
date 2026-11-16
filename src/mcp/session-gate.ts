/**
 * Structural enforcement for the RPG flow (Read → Plan → validate → Generate).
 *
 * generate_css_tokens must not succeed for a given hex+theme+model until
 * validate_pairings has passed for that same hex+theme+model in this session.
 * This makes the rule a protocol-level contract instead of a prompt-only
 * suggestion, so it holds regardless of whether the client supports MCP prompts.
 *
 * The model is part of the key: a WCAG 2 validation says nothing about APCA
 * pairings (and vice versa) — they are different matrices.
 */
export class SessionGate {
  private readonly validated = new Set<string>()

  private key(hex: string, theme: string, model: string): string {
    return `${hex.toLowerCase()}:${theme}:${model}`
  }

  markValidated(hex: string, theme: string, model: string = 'wcag2'): void {
    this.validated.add(this.key(hex, theme, model))
  }

  isValidated(hex: string, theme: string, model: string = 'wcag2'): boolean {
    return this.validated.has(this.key(hex, theme, model))
  }
}
