import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Row, SelectorKey } from '../types'
import { CAVEMAN_FLAGS, CHOICES, PONYTAIL_FLAGS, boardPath, confirmedEffort, firstLine, flagValue, isTestCommand, modelName } from './logic'

const row = atom({ plugin: 'statusline-controls', key: 'row' } as const, { open: null, effort: '?', tests: null } as Row)

// Windows define USERPROFILE y no HOME.
const home = async ($: EngineInterface) => (await $.env.get('HOME')) ?? (await $.env.get('USERPROFILE'))
const claudeDir = async ($: EngineInterface) => (await $.env.get('CLAUDE_CONFIG_DIR')) ?? `${await home($)}/.claude`

async function readFlag($: EngineInterface, dir: string, name: string, allowed: readonly string[]) {
  return flagValue(await $.fs.read(`${dir}/${name}`).catch(() => undefined), allowed)
}

// Al abrir, las opciones caen en las columnas de la fila plegada: el segundo clic de un doble clic
// aterrizaría en una de ellas. Durante esta pausa una opción no hace nada.
const OPEN_GUARD_MS = 400
let openedAt = 0

// El mismo comando que teclearía la persona: la lógica de cada modo sigue en su plugin.
async function pick($: EngineInterface, key: SelectorKey, value: string) {
  if ((await $.clock.now()) - openedAt < OPEN_GUARD_MS) return
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

// Abre el board que regenera ponytail; el mod no lo genera.
async function openBoard($: EngineInterface) {
  const file = boardPath({
    XDG_CONFIG_HOME: (await $.env.get('XDG_CONFIG_HOME')) ?? undefined,
    HOME: (await $.env.get('HOME')) ?? undefined,
    USERPROFILE: (await $.env.get('USERPROFILE')) ?? undefined,
  })
  if ((await $.fs.read(file).catch(() => undefined)) === undefined) {
    $.ui.toast('ponytail has not generated the board yet')
    return
  }
  await openWithSystem($, file)
}

const isWindows = async ($: EngineInterface) => (await $.env.get('OS')) === 'Windows_NT'

// Lo que haría un doble clic: el navegador para un fichero, el explorador para una carpeta.
async function openWithSystem($: EngineInterface, target: string) {
  const windows = await isWindows($)
  const mac = !windows && (await $.process.run(['uname']).catch(() => undefined))?.stdout.trim() === 'Darwin'
  await $.process.run(windows ? ['cmd', '/c', 'start', '', target] : [mac ? 'open' : 'xdg-open', target])
}

// En Windows `code` es un .cmd: solo arranca a través de cmd.
async function openInCode($: EngineInterface, dir: string) {
  await $.process.run((await isWindows($)) ? ['cmd', '/c', 'code', dir] : ['code', dir])
}

// En el terminal, iconos de Nerd Font (nf-fa-folder_open y nf-md-microsoft_visual_studio_code);
// la fuente del escritorio no los tiene y pinta emoji.
const ICONS = {
  terminal: { folder: '\uF07C', code: '\u{F0A1E}' },
  other: { folder: '📁', code: '💻' },
}

// Columnas que sangra Claude Code en la status line y la línea de pista: la fila se alinea con ellas.
const INDENT = 2

export const register: Register = on => {
  // Los dos shells que usa Claude Code: en Windows el principal suele ser PowerShell.
  for (const tool of ['Bash', 'PowerShell'] as const) {
    on('tool.call', { tool }, async ($, e, next) => {
      const ran = await next(e)
      // Solo cuenta un test cuyo resultado llega con la llamada; uno en segundo plano aún no ha acabado.
      if (ran.deny === undefined && !e.run_in_background && isTestCommand(e.command))
        await update($, row, r => ({ ...r, tests: ran.isError ? 'failed' : 'passed' }))
      return ran
    })
  }

  // turn.step va en streaming: solo admite un generador asíncrono que reenvía el stream.
  on('turn.step', async function* ($, e, next) {
    if (e.agentId === undefined && e.effort !== undefined) await update($, row, r => ({ ...r, effort: String(e.effort) }))
    return yield* next(e)
  })

  // Banda sobre el prompt, no la línea de pista: pintar esa línea apaga sus pastillas («2 shells»).
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const r = await read($, row)
    const { Box, Text, Button } = $.ui.resolve(e)
    // La sangría es la del terminal; en el escritorio la banda ya tiene su margen.
    const indent = e.surface === 'terminal' ? INDENT : 0
    const icons = e.surface === 'terminal' ? ICONS.terminal : ICONS.other
    const toggle = async (key: SelectorKey) => {
      openedAt = await $.clock.now()
      await update($, row, x => ({ ...x, open: x.open === key ? null : key }))
    }

    const dir = await claudeDir($)
    const modelId = await $.session.model().catch(() => '?')
    const cwd = await $.session.cwd()
    const current: Record<SelectorKey, string> = {
      model: CHOICES.model.values.find(v => modelId.includes(v)) ?? '',
      effort: r.effort,
      caveman: await readFlag($, dir, '.caveman-active', CAVEMAN_FLAGS),
      ponytail: await readFlag($, dir, '.ponytail-active', PONYTAIL_FLAGS),
    }

    if (r.open !== null) {
      const key = r.open
      return (
        <Box flexDirection="row" gap={1} paddingLeft={indent}>
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
        </Box>
      )
    }

    return (
      // El modelo a la izquierda; los tests, los modos y Board pegados a la derecha, junto al [-] del motor.
      <Box flexDirection="row" justifyContent="space-between" width={e.props.bodyColumns} paddingLeft={indent}>
        <Box flexDirection="row" gap={1}>
          <Box key="model-icon">
            <Text>🤖</Text>
          </Box>
          <Button key="model" plain onPress={() => toggle('model')}>
            <Text color="#c678dd">{modelId === '?' ? '?' : modelName(modelId)}</Text>
          </Button>
          <Button key="effort" plain onPress={() => toggle('effort')}>
            <Text dimColor>({r.effort})</Text>
          </Button>
          <Box key="model-sep">
            <Text dimColor>|</Text>
          </Box>
          {/* Solo lo que va entre corchetes se pulsa: el icono queda fuera del botón. */}
          <Box key="folder-icon">
            <Text color="#e5c07b">{icons.folder}</Text>
          </Box>
          <Button key="folder" plain onPress={() => openWithSystem($, cwd).catch(() => $.ui.toast('could not open the folder'))}>
            <Text color="#e5c07b">[folder]</Text>
          </Button>
          <Box key="open-sep">
            <Text dimColor>|</Text>
          </Box>
          <Box key="code-icon">
            <Text color="#007acc">{icons.code}</Text>
          </Box>
          <Button key="code" plain onPress={() => openInCode($, cwd).catch(() => $.ui.toast('could not open VS Code'))}>
            <Text color="#007acc">[code]</Text>
          </Button>
        </Box>
        <Box flexDirection="row" gap={1}>
          {r.tests !== null && (
            <Box key="tests-icon">
              <Text>🧪</Text>
            </Box>
          )}
          {r.tests !== null && (
            <Box key="tests">
              <Text color={r.tests === 'passed' ? 'green' : 'red'}>[{r.tests}]</Text>
            </Box>
          )}
          {r.tests !== null && (
            <Box key="tests-sep">
              <Text dimColor>|</Text>
            </Box>
          )}
          <Box key="caveman-icon">
            <Text>🗿</Text>
          </Box>
          <Button key="caveman" plain onPress={() => toggle('caveman')}>
            <Text>[{current.caveman}]</Text>
          </Button>
          <Box key="modes-sep">
            <Text dimColor>|</Text>
          </Box>
          <Box key="ponytail-icon">
            <Text>🦥</Text>
          </Box>
          <Button key="ponytail" plain onPress={() => toggle('ponytail')}>
            <Text>[{current.ponytail}]</Text>
          </Button>
          <Button key="board" plain label="[Board]" onPress={() => openBoard($).catch(() => $.ui.toast('could not open the board'))} />
        </Box>
      </Box>
    )
  }).catch(($, e, next) => next(e))
}
