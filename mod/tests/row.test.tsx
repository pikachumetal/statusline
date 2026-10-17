import { expect, mock, test } from 'claude-code/testing'
import type { EngineInterface, On } from 'claude-code'

const ROW = {
  plugin: 'statusline-controls',
  surface: 'terminal',
  component: 'PromptHint',
  props: { isDraft: false, isWorking: false, hint: '? for shortcuts' },
} as const

const MINUTES_30 = 30 * 60000

// Una sesión de 30 minutos en Opus 5.5 con 7.50 USD, caveman activo y sin flag de ponytail; cada opción cambia una pieza.
type Session = {
  usd?: () => number | null
  usageFails?: boolean
  modelFails?: boolean
  envThrows?: boolean
  // Respuesta de cada comando, por nombre; un nombre en missing no existe.
  responses?: Record<string, string>
  missing?: string[]
}

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
  // El motor bajo los plugins: responde cada paso de turno que el test lanza.
  on('turn.step', async function* ($, e) {
    return { turnId: e.turnId, index: e.index, answer: '', toolUses: [] } as never
  })
  const sent: string[] = []
  const toasts: string[] = []
  on('command.run', ($, e) => {
    // Claude Code rechaza un comando que no existe.
    if (opts.missing?.includes(e.command)) throw new Error(`unknown command ${e.command}`)
    sent.push(`/${e.command} ${e.args}`.trim())
    return { text: opts.responses?.[e.command] ?? '' }
  })
  on('ui.toast', ($, e) => {
    toasts.push(e.text)
    return { value: undefined }
  })
  return { sent, toasts }
}

// turn.step es un stream: hay que leerlo entero para que corran los hooks.
async function step($: EngineInterface, effort: string) {
  for await (const _ of $.turn.step({ model: 'claude-opus-5-5', effort, turnId: 't1', index: 0, messageCount: 1 } as never));
}

test('collapsed row shows the six controls in order', async ($, on) => {
  session(on)
  await step($, 'medium')
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

const SET_HIGH = 'Set effort level to high (saved as your default for new sessions): Comprehensive implementation'

test('opening a selector hides the rest of the row', async ($, on) => {
  session(on)
  await step($, 'medium')
  const ui = await $.ui.mount(ROW)
  await ui.press({ key: 'effort' })
  for (const v of ['low', 'medium', 'high', 'xhigh', 'max']) expect(await ui.find({ key: `effort-${v}` })).toBeDefined()
  expect(await ui.find({ key: 'close' })).toBeDefined()
  expect(await ui.find({ key: 'model' })).toBeUndefined()
  expect(await ui.find({ key: 'board' })).toBeUndefined()
  expect(await ui.find({ text: /\? for shortcuts/ })).toBeDefined()
  await ui.unmount()
})

test('picking an option runs the command and folds', async ($, on) => {
  const { sent, toasts } = session(on, { responses: { effort: SET_HIGH } })
  await step($, 'medium')
  const ui = await $.ui.mount(ROW)
  await ui.press({ key: 'effort' })
  await ui.press({ key: 'effort-high' })
  expect(sent).toEqual(['/effort high'])
  expect(await ui.find({ key: 'model' })).toBeDefined()
  expect(await ui.find({ text: /\(high\)/ })).toBeDefined()
  expect(toasts.some(t => t.includes('Set effort level to high'))).toBe(true)
  await ui.unmount()
})

test('a change Claude Code keeps out leaves the confirmed effort', async ($, on) => {
  const { toasts } = session(on, { responses: { effort: 'Kept effort level as medium' } })
  await step($, 'medium')
  const ui = await $.ui.mount(ROW)
  await ui.press({ key: 'effort' })
  await ui.press({ key: 'effort-low' })
  expect(await ui.find({ text: /\(medium\)/ })).toBeDefined()
  expect(toasts).toContain('Kept effort level as medium')
  await ui.unmount()
})

test('every selector runs its own command', async ($, on) => {
  const { sent } = session(on)
  const ui = await $.ui.mount(ROW)
  for (const [pill, option] of [['model', 'model-sonnet'], ['caveman', 'caveman-ultracave'], ['ponytail', 'ponytail-lite']]) {
    await ui.press({ key: pill! })
    await ui.press({ key: option! })
  }
  expect(sent).toEqual(['/model sonnet', '/caveman:caveman ultracave', '/ponytail:ponytail lite'])
  await ui.unmount()
})

test('a missing command folds and says so', async ($, on) => {
  const { toasts } = session(on, { missing: ['ponytail:ponytail'] })
  const ui = await $.ui.mount(ROW)
  await ui.press({ key: 'ponytail' })
  await ui.press({ key: 'ponytail-full' })
  expect(await ui.find({ key: 'model' })).toBeDefined()
  expect(await ui.find({ text: /🦥 off/ })).toBeDefined()
  expect(toasts).toContain('/ponytail:ponytail is not available')
  await ui.unmount()
})

test('close folds without a command', async ($, on) => {
  const { sent } = session(on)
  await step($, 'medium')
  const ui = await $.ui.mount(ROW)
  await ui.press({ key: 'effort' })
  await ui.press({ key: 'close' })
  expect(sent).toEqual([])
  expect(await ui.find({ text: /\(medium\)/ })).toBeDefined()
  await ui.unmount()
})

test('pressing the same pill twice closes it', async ($, on) => {
  const { sent } = session(on)
  const ui = await $.ui.mount(ROW)
  await ui.press({ key: 'effort' })
  await ui.press({ key: 'effort' })
  expect(sent).toEqual([])
  expect(await ui.find({ key: 'model' })).toBeDefined()
  await ui.unmount()
})

test('the selector stays open when a turn starts', async ($, on) => {
  session(on)
  const ui = await $.ui.mount(ROW)
  await ui.press({ key: 'effort' })
  await step($, 'medium')
  await ui.redraw()
  expect(await ui.find({ key: 'effort-high' })).toBeDefined()
  await ui.unmount()
})

test('toast shows the first line of the response', async ($, on) => {
  const { toasts } = session(on, { responses: { model: '\nline one\nline two' } })
  const ui = await $.ui.mount(ROW)
  await ui.press({ key: 'model' })
  await ui.press({ key: 'model-sonnet' })
  expect(toasts).toContain('line one')
  await ui.unmount()
})
