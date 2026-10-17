import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Row, SelectorKey } from '../types'
import { CAVEMAN_FLAGS, CHOICES, PONYTAIL_FLAGS, confirmedEffort, costText, firstLine, flagValue, modelName } from './logic'

const row = atom({ plugin: 'statusline-controls', key: 'row' } as const, { open: null, effort: '?', tests: null } as Row)

// Windows define USERPROFILE y no HOME.
const home = async ($: EngineInterface) => (await $.env.get('HOME')) ?? (await $.env.get('USERPROFILE'))
const claudeDir = async ($: EngineInterface) => (await $.env.get('CLAUDE_CONFIG_DIR')) ?? `${await home($)}/.claude`

async function readFlag($: EngineInterface, dir: string, name: string, allowed: readonly string[]) {
  return flagValue(await $.fs.read(`${dir}/${name}`).catch(() => undefined), allowed)
}

// El mismo comando que teclearía la persona: la lógica de cada modo sigue en su plugin.
async function pick($: EngineInterface, key: SelectorKey, value: string) {
  await update($, row, r => ({ ...r, open: null }))
  const { command } = CHOICES[key]
  const text = await $.command.run({ command, args: value }).then(
    r => r.text ?? '',
    () => undefined,
  )
  if (text === undefined) {
    $.ui.toast(`/${command} is not available`)
    return
  }
  const effort = key === 'effort' ? confirmedEffort(text) : undefined
  if (effort !== undefined) await update($, row, r => ({ ...r, effort }))
  $.ui.toast(firstLine(text))
}

export const register: Register = on => {
  // turn.step va en streaming: solo admite un generador asíncrono que reenvía el stream.
  on('turn.step', async function* ($, e, next) {
    if (e.agentId === undefined && e.effort !== undefined) await update($, row, r => ({ ...r, effort: String(e.effort) }))
    return yield* next(e)
  })

  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    const r = await read($, row)
    const { Box, Text, Button } = $.ui.resolve(e)
    const hint = <Text dimColor>{e.props.hint}</Text>
    const toggle = (key: SelectorKey) => update($, row, x => ({ ...x, open: x.open === key ? null : key }))

    const dir = await claudeDir($)
    const modelId = await $.session.model().catch(() => '?')
    const current: Record<SelectorKey, string> = {
      model: CHOICES.model.values.find(v => modelId.includes(v)) ?? '',
      effort: r.effort,
      caveman: await readFlag($, dir, '.caveman-active', CAVEMAN_FLAGS),
      ponytail: await readFlag($, dir, '.ponytail-active', PONYTAIL_FLAGS),
    }

    if (r.open !== null) {
      const key = r.open
      return (
        <Box flexDirection="row" gap={1}>
          <Button key={key} plain label={key} onPress={() => toggle(key)} />
          {CHOICES[key].values.map(v => (
            <Button
              key={`${key}-${v}`}
              label={v}
              {...(v === current[key] ? { variant: 'primary' as const } : { plain: true as const, dimColor: true })}
              onPress={() => pick($, key, v)}
            />
          ))}
          <Button key="close" plain dimColor label="✕" onPress={() => toggle(key)} />
          {hint}
        </Box>
      )
    }

    const usage = await $.session.usage().catch(() => undefined)
    const now = await $.clock.now()
    // Board llega en la siguiente task.
    const idle = () => undefined

    return (
      <Box flexDirection="row" gap={2}>
        <Box flexDirection="row" gap={1}>
          <Button key="model" plain onPress={() => toggle('model')}>
            <Text color="#c678dd">🤖 {modelId === '?' ? '?' : modelName(modelId)}</Text>
          </Button>
          <Button key="effort" plain onPress={() => toggle('effort')}>
            <Text dimColor>({r.effort})</Text>
          </Button>
        </Box>
        <Button key="caveman" plain onPress={() => toggle('caveman')}>
          <Text>🗿 {current.caveman}</Text>
        </Button>
        <Button key="ponytail" plain onPress={() => toggle('ponytail')}>
          <Text>🦥 {current.ponytail}</Text>
        </Button>
        <Box key="cost">
          {usage === undefined ? (
            <Text color="gray">⚠</Text>
          ) : (
            <Text color="#d19a66">💰 {costText(usage.cost?.usd ?? 0, usage.startedAt, now)}</Text>
          )}
        </Box>
        <Button key="board" plain label="Board" onPress={idle} />
        {hint}
      </Box>
    )
  }).catch(($, e, next) => next(e))
}
