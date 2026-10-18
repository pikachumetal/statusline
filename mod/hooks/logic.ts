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

export function modelName(id: string): string {
  const m = /^claude-([a-z]+)-(\d+)-(\d+)/.exec(id)
  if (!m) return id
  const family = m[1]!
  return `${family[0]!.toUpperCase()}${family.slice(1)} ${m[2]}.${m[3]}`
}

export function flagValue(raw: string | undefined, allowed: readonly string[]): string {
  if (raw === undefined || new TextEncoder().encode(raw).length > FLAG_MAX_BYTES) return 'off'
  const value = raw.trim()
  return allowed.includes(value) ? value : 'off'
}

// La única forma de saber si /effort aplicó el nivel es su respuesta; si el texto cambia, la fila se queda con el anterior.
export function confirmedEffort(response: string): string | undefined {
  return /^Set effort level to (\w+)/.exec(response)?.[1]
}

export function firstLine(text: string, max = 80): string {
  return (text.split('\n').find(line => line.trim() !== '') ?? 'ok').trim().slice(0, max)
}

// La expresión de ponytail más los runners de este repo: node con un *.test.* e Invoke-Pester.
const TEST_COMMAND =
  /\b(npm (run )?test|pnpm (run )?test|yarn test|bun test|npx (jest|vitest)|jest|vitest|pytest|python3? -m pytest|go test|cargo test|mvn test|gradle test|rspec|phpunit|dotnet test|node --test|deno test|make test|node \S+\.test\.(js|mjs|cjs|ts)|Invoke-Pester)\b/

export const isTestCommand = (command: string) => TEST_COMMAND.test(command)

// La misma ruta en la que ponytail regenera su board.
export function boardPath(env: { XDG_CONFIG_HOME?: string; HOME?: string; USERPROFILE?: string }): string {
  return `${env.XDG_CONFIG_HOME ?? `${env.HOME ?? env.USERPROFILE}/.config`}/ponytail/band/board.html`
}
