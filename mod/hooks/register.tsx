import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Row } from '../types'
import { CAVEMAN_FLAGS, PONYTAIL_FLAGS, costText, flagValue, modelName } from './logic'

const row = atom({ plugin: 'statusline-controls', key: 'row' } as const, { open: null, effort: '?', tests: null } as Row)

// Windows define USERPROFILE y no HOME.
const home = async ($: EngineInterface) => (await $.env.get('HOME')) ?? (await $.env.get('USERPROFILE'))
const claudeDir = async ($: EngineInterface) => (await $.env.get('CLAUDE_CONFIG_DIR')) ?? `${await home($)}/.claude`

async function readFlag($: EngineInterface, dir: string, name: string, allowed: readonly string[]) {
  return flagValue(await $.fs.read(`${dir}/${name}`).catch(() => undefined), allowed)
}

export const register: Register = on => {
  // turn.step va en streaming: solo admite un generador asíncrono que reenvía el stream.
  on('turn.step', async function* ($, e, next) {
    if (e.agentId === undefined && e.effort !== undefined) await update($, row, r => ({ ...r, effort: String(e.effort) }))
    return yield* next(e)
  })

  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    const r = await read($, row)
    const dir = await claudeDir($)
    const model = await $.session.model().then(modelName, () => '?')
    const caveman = await readFlag($, dir, '.caveman-active', CAVEMAN_FLAGS)
    const ponytail = await readFlag($, dir, '.ponytail-active', PONYTAIL_FLAGS)
    const usage = await $.session.usage().catch(() => undefined)
    const now = await $.clock.now()
    const { Box, Text, Button } = $.ui.resolve(e)
    // Las pastillas aún no abren nada; el selector llega en la siguiente task.
    const idle = () => undefined

    const cost = (
      <Box key="cost">
        {usage === undefined ? (
          <Text color="gray">⚠</Text>
        ) : (
          <Text color="#d19a66">💰 {costText(usage.cost?.usd ?? 0, usage.startedAt, now)}</Text>
        )}
      </Box>
    )

    return (
      <Box flexDirection="row" gap={2}>
        <Box flexDirection="row" gap={1}>
          <Button key="model" plain onPress={idle}>
            <Text color="#c678dd">🤖 {model}</Text>
          </Button>
          <Button key="effort" plain onPress={idle}>
            <Text dimColor>({r.effort})</Text>
          </Button>
        </Box>
        <Button key="caveman" plain onPress={idle}>
          <Text>🗿 {caveman}</Text>
        </Button>
        <Button key="ponytail" plain onPress={idle}>
          <Text>🦥 {ponytail}</Text>
        </Button>
        {cost}
        <Button key="board" plain label="Board" onPress={idle} />
        <Text dimColor>{e.props.hint}</Text>
      </Box>
    )
  }).catch(($, e, next) => next(e))
}
