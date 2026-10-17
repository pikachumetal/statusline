import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const ROW = {
  plugin: 'statusline-controls',
  surface: 'terminal',
  component: 'PromptHint',
  props: { isDraft: false, isWorking: false, hint: '? for shortcuts' },
} as const

const MINUTES_30 = 30 * 60000

// Una sesión de 30 minutos en Opus 5.5 con 7.50 USD, caveman activo y sin flag de ponytail; cada opción cambia una pieza.
type Session = { usd?: () => number | null; usageFails?: boolean; modelFails?: boolean; envThrows?: boolean }

function session(on: On, opts: Session = {}) {
  const usd = opts.usd ?? (() => 7.5)
  mock.clock(on, { now: MINUTES_30 })
  mock.store(on)
  if (opts.envThrows) {
    on('env.get', () => {
      throw new Error('boom')
    })
  } else mock.env(on, { HOME: '/home/u' })
  on('session.model', () => (opts.modelFails ? { deny: 'no model yet' } : { value: 'claude-opus-5-5' }) as never)
  on('session.usage', () => {
    if (opts.usageFails) return { deny: 'unavailable' } as never
    const v = usd()
    return { value: v === null ? { startedAt: 0 } : { startedAt: 0, cost: { usd: v } } } as never
  })
  on('fs.read', ($, e) => (e.path.replaceAll('\\', '/').endsWith('/.claude/.caveman-active') ? { value: 'caveman' } : { deny: 'missing' }) as never)
  // Lo que pinta Claude Code sin el mod.
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine hint</Text>
  })
}

test('collapsed row shows the six controls in order', async ($, on) => {
  session(on)
  on('turn.step', async function* ($, e) {
    return { turnId: e.turnId, index: e.index, answer: '', toolUses: [] } as never
  })
  // turn.step es un stream: hay que leerlo entero para que corran los hooks.
  for await (const _ of $.turn.step({ model: 'claude-opus-5-5', effort: 'medium', turnId: 't1', index: 0, messageCount: 1 } as never));
  const ui = await $.ui.mount(ROW)
  for (const key of ['model', 'effort', 'caveman', 'ponytail', 'board']) expect(await ui.find({ key })).toBeDefined()
  expect(await ui.find({ text: /🤖 Opus 5\.5/ })).toBeDefined()
  expect(await ui.find({ text: /\(medium\)/ })).toBeDefined()
  expect(await ui.find({ text: /🗿 caveman/ })).toBeDefined()
  expect(await ui.find({ text: /🦥 off/ })).toBeDefined()
  expect(await ui.find({ text: /💰 \$7\.50 · \$15\.00\/h/ })).toBeDefined()
  expect(await ui.find({ text: /\? for shortcuts/ })).toBeDefined()
  await ui.unmount()
})

test('cost is read on every render', async ($, on) => {
  let usd = 7.5
  session(on, { usd: () => usd })
  const ui = await $.ui.mount(ROW)
  expect(await ui.find({ text: /💰 \$7\.50/ })).toBeDefined()
  usd = 7.55
  await ui.redraw()
  expect(await ui.find({ text: /💰 \$7\.55/ })).toBeDefined()
  await ui.unmount()
})

test('usage that fails leaves a warning in place of the cost', async ($, on) => {
  session(on, { usageFails: true })
  const ui = await $.ui.mount(ROW)
  expect(await ui.find({ key: 'cost', text: /⚠/ })).toBeDefined()
  expect(await ui.find({ key: 'model' })).toBeDefined()
  await ui.unmount()
})

test('usage without cost shows zero', async ($, on) => {
  session(on, { usd: () => null })
  const ui = await $.ui.mount(ROW)
  expect(await ui.find({ text: /💰 \$0\.00/ })).toBeDefined()
  expect(await ui.find({ text: /\/h/ })).toBeUndefined()
  await ui.unmount()
})

test('model that cannot be read shows a question mark', async ($, on) => {
  session(on, { modelFails: true })
  const ui = await $.ui.mount(ROW)
  expect(await ui.find({ text: /🤖 \?/ })).toBeDefined()
  await ui.unmount()
})

test('a failing render falls back to the engine line', async ($, on) => {
  session(on, { envThrows: true })
  const ui = await $.ui.mount(ROW)
  expect(await ui.find({ text: /engine hint/ })).toBeDefined()
  expect(await ui.find({ key: 'model' })).toBeUndefined()
  await ui.unmount()
})
