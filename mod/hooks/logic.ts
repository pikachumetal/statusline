import type { SelectorKey } from '../types'

export type { SelectorKey }

export const CHOICES: Record<SelectorKey, { command: string; values: readonly string[] }> = {
  model: { command: 'model', values: ['opus', 'sonnet', 'haiku'] },
  effort: { command: 'effort', values: ['low', 'medium', 'high', 'xhigh', 'max'] },
  caveman: { command: 'caveman:caveman', values: ['caveman', 'ultracave', 'megacave'] },
  ponytail: { command: 'ponytail:ponytail', values: ['off', 'lite', 'full', 'ultra'] },
}

// Las mismas whitelists que statusline.js: caveman 3.x más los modos 2.x de perfiles sin actualizar.
export const CAVEMAN_FLAGS = ['caveman', 'ultracave', 'megacave', 'lite', 'full', 'ultra', 'wenyan-lite', 'wenyan', 'wenyan-full', 'wenyan-ultra', 'commit', 'review', 'compress'] as const
export const PONYTAIL_FLAGS = ['off', 'lite', 'full', 'ultra', 'review'] as const

const FLAG_MAX_BYTES = 64
// Por debajo de 5 minutos el ritmo se dispara con la primera respuesta y no informa.
const MIN_RATE_MS = 5 * 60000

export function modelName(id: string): string {
  const m = /^claude-([a-z]+)-(\d+)-(\d+)/.exec(id)
  if (!m) return id
  const family = m[1]!
  return `${family[0]!.toUpperCase()}${family.slice(1)} ${m[2]}.${m[3]}`
}

export function costText(usd: number, startedAt: number, now: number): string {
  const ms = now - startedAt
  const total = `$${usd.toFixed(2)}`
  return ms >= MIN_RATE_MS && usd > 0 ? `${total} · $${(usd / (ms / 3600000)).toFixed(2)}/h` : total
}

export function flagValue(raw: string | undefined, allowed: readonly string[]): string {
  if (raw === undefined || new TextEncoder().encode(raw).length > FLAG_MAX_BYTES) return 'off'
  const value = raw.trim()
  return allowed.includes(value) ? value : 'off'
}
