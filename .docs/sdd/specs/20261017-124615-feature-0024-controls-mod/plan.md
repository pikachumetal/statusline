---
id: 20261017-124615-feature-0024-controls-mod
feature: 0024
title: Plan de implementación — Mod de controles bajo la status line
spec: ./spec.md
status: approved
created: 2026-10-17
---

# Plan de implementación — Mod de controles bajo la status line

## Decisiones que he tomado yo — valida estas

1. Modelo y effort: en Native la sesión implementa las cuatro tasks; va bien en gama media (Sonnet, effort medium). El revisor final de rama va con `sdd-kit:effort-high` + `opus`. — Es la única revisión independiente de Native.
2. Ejecución: Native. — Las tasks 1-3 tocan los mismos dos ficheros (`mod/hooks/register.tsx`, `mod/hooks/logic.ts`) en cadena, y la 4 es pequeña; un subagente por task repetiría el contexto del motor de mods cuatro veces.
3. La lógica sin motor va en `mod/hooks/logic.ts` (funciones puras) y el pintado y los hooks, en `mod/hooks/register.tsx`. — Es la misma separación que `render`/`readEnv` en `statusline.js`: lo puro se prueba sin simular el motor.
4. La detección de tests parte de la expresión de ponytail (`metrics.ts:92`) y añade `node <algo>.test.<js|mjs|cjs|ts>` e `Invoke-Pester`. — La spec pide que `node statusline.test.js` cuente, y ponytail no lo reconoce.
5. El CLI falso de los tests del instalador es un `.cmd` que apunta en un fichero cada llamada con su `CLAUDE_CONFIG_DIR` y sale con el código de `FAKE_CLAUDE_EXIT`. — Permite comprobar los argumentos, el perfil y los fallos sin tocar perfiles reales.
6. La verificación «visual» es en el terminal, no en un navegador: el mod no es una página web. Cada task con UI se prueba con `claude --plugin-dir mod`. No se propone `§Frontend` en `tech-stack.md`. — El detector y Playwright del kit son para interfaces web.
7. Riesgo alto: el harness de `claude-code/testing` es nuevo y solo lo conozco por los tests de ponytail; si `ui.mount` de `PromptHint` no se comporta como el de `AbovePrompt`, la task 1 lo dirá antes que las demás.
8. Coste estimado: ~2.5 h de implementación más la revisión final con Opus (orden de 150-250k tokens).
9. Review Focus: 5 entradas que la spec no fija, con su comportamiento esperado; ver la sección.

**Goal**: Fila clicable bajo la status line con selectores de modelo, effort, caveman y ponytail, coste en vivo, estado de tests y Board, instalada por `install.ps1`.

**Architecture**: Un mod de Claude Code en `mod/` que pinta su árbol en `ui.render` de `PromptHint` y lanza los mismos comandos que escribiría la persona. El repo es un marketplace de carpeta y `install.ps1` registra el mod en cada perfil con el CLI `claude`.

**Tech Stack**: TypeScript/TSX que compila Claude Code (≥ 2.1.302), `claude-code/testing` para los tests del mod, PowerShell 7+ para el instalador, Node para `statusline.test.js`.

**Spec**: `./spec.md`

**Ejecución**: native, porque las tasks 1-3 comparten ficheros en cadena y la 4 es pequeña. Si esta sesión se retomó tras una compactación (empieza por «This session is being continued from a previous conversation») y quedan dos o más tasks sin su línea `complete` en el ledger, no las hagas tú: despacha las que quedan con subagent-driven-development sobre el mismo ledger. La sesión que ejecuta va bien en gama media (Sonnet, effort medium); el modelo más capaz se reserva para la revisión final.

## Restricciones globales

### De código

- Sin dependencias npm: ni `package.json` ni `node_modules`. El TypeScript del mod lo compila Claude Code.
- Claude Code ≥ 2.1.302 (motor de mods).
- El mod no escribe ficheros. Su estado vive en `$.state` de la sesión.
- Flags `.caveman-active` y `.ponytail-active`: máximo 64 bytes y whitelist; fuera de eso, `off`. Whitelist de caveman: `caveman`, `ultracave`, `megacave`, `lite`, `full`, `ultra`, `wenyan-lite`, `wenyan`, `wenyan-full`, `wenyan-ultra`, `commit`, `review`, `compress`. Whitelist de ponytail: `off`, `lite`, `full`, `ultra`, `review`.
- Texto que pinta el mod y sus avisos, en inglés. Mensajes de `install.ps1`, en castellano (como hoy).
- El texto de un comando de Bash nunca se pinta. Un aviso enseña como mucho la primera línea de una respuesta, recortada a 80 caracteres.
- `statusline.js` no se toca.
- Comentarios en castellano, solo para el porqué; ningún comentario repite el código ni cita la spec, el plan, la task o una capacidad.

### De proceso

- Commits: tipo y scope en inglés, título y cuerpo en castellano, con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Modelos: la sesión implementa (Native); revisor final `sdd-kit:effort-high` + `opus`.
- Antes de cada commit: `node statusline.test.js` y, desde la task 1, `claude plugin test mod`.

## Review Focus

- El motor llama al render con `$.session.model()` rechazado (sesión sin modelo todavía) → la fila sale con `🤖 ?` y el resto igual · Task 1, `model that cannot be read shows a question mark`
- `cost.usd` ausente en `usage()` (sesión sin coste, p. ej. fuera de suscripción) → `💰 $0.00`, sin `$/h` · Task 1, `usage without cost shows zero`
- Respuesta de un comando vacía o con varias líneas → el aviso enseña la primera línea no vacía o `ok` · Task 2, `toast shows the first line of the response`
- Pulsar dos veces seguidas la misma pastilla plegada → abre y luego cierra el selector, sin comandos · Task 2, `pressing the same pill twice closes it`
- `install.ps1` con `-ConfigDir` que contiene espacios → el CLI recibe el perfil entero en `CLAUDE_CONFIG_DIR` · Task 4, `install con perfil con espacios`

---

## Phase -1 — Pre-Implementation Gates

- [x] **Simplicity gate**: cuatro tasks, sin abstracciones; la lógica pura en un solo fichero.
- [x] **YAGNI gate**: sin configuración del mod, sin recuento de tests, sin `off` de caveman.
- [x] **Brownfield gate**: `statusline.js` intacto; `install.ps1` conserva su comportamiento y añade el mod después.
- [x] **Constitution check**: la task 1 aplica las enmiendas de la decisión 18 de la spec.

---

## 1. Decisiones técnicas

### 1.1 Estructura de ficheros

**Crear**:

- `.claude-plugin/marketplace.json` — marketplace de carpeta `statusline` con el plugin `statusline-controls`, `source: ./mod`.
- `mod/.claude-plugin/plugin.json` — manifiesto (`name: statusline-controls`, `types: ./types/index.d.ts`).
- `mod/hooks/hooks.json` — `{ "modules": ["./register.tsx"] }`.
- `mod/hooks/logic.ts` — funciones puras y constantes.
- `mod/hooks/register.tsx` — hooks y pintado.
- `mod/types/index.d.ts` — contrato de `$.state`.
- `mod/tests/logic.test.ts`, `mod/tests/row.test.tsx` — tests del mod.
- `.docs/sdd/specs/<carpeta>/tasks.md` — registro vivo.

**Modificar**:

- `install.ps1` — parámetro `-Claude`, instalación del mod tras la status line en los dos caminos (limpia y update).
- `statusline.test.js` — tests del instalador con el CLI falso.
- `.docs/sdd/constitution.md`, `tech-stack.md`, `architecture.md`, `mission.md`, `CLAUDE.md` — enmiendas.
- `README.md`, `README.en.md` — sección del mod.
- `.docs/sdd/roadmap.md` — fila de la 0024 (en la apertura).

**NO se tocan**:

- `statusline.js`, `statusline.cmd`, `statusline-orca.cmd` — la spec deja el layout a la 0023.

### 1.6 Dependencias

- Claude Code ≥ 2.1.302 con mods. Ejemplo de tests del motor: `~/.claude/plugins/cache/ponytail/ponytail/5.3.2/tests/band.test.tsx`.
- Spike de referencia: `~/.claude/dev-mods/9e4571b1-54a7-4504-afa0-8ad3b8b49a21/statusline-spike/hooks/register.tsx`.

### 1.7 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| `ui.mount` de `PromptHint` en el harness no se comporta como en ponytail | media | alto | Task 1 lo prueba primero; si falla, la lógica sigue probada en `logic.test.ts` y el render se valida a mano |
| `claude plugin install` real falla al repetirse sobre un perfil con el mod | media | medio | Se prueba con el CLI real en la validación (decisión 14 de la spec) |
| El texto `Set effort level to` cambia en una versión futura | baja | bajo | Fallo benigno: la fila se queda con el effort anterior |

### 1.8 Rollout

Directo: `install.ps1` en los dos perfiles tras el merge. La banda de ponytail se oculta con `/ponytail band off`.

### 1.9 Excepciones a la constitution

Las enmiendas de la decisión 18 de la spec, aprobadas con la spec («ok», 2026-10-17); las aplica la task 1.

---

## 2. Tasks

### Task 1 — Fila plegada con datos en vivo

**Modelo**: sesión (Native).
**Tests RED**: hilo principal · `mod/tests/logic.test.ts`, `mod/tests/row.test.tsx`.
**Superficies**: tooling (mod) · docs.
**Verificación**: `claude plugin validate mod` y `claude plugin test mod`.
**Se prueba en la aplicación**: `claude --plugin-dir mod` en este repo: bajo la status line sale `🤖 Opus 5.5 (medium) 🗿 caveman 🦥 lite 💰 $x · $y/h Board` y detrás la pista del motor; las pastillas aún no abren nada.

**Interfaces**:
- Consume: nada.
- Produce, en `mod/hooks/logic.ts`:
  - `type SelectorKey = 'model' | 'effort' | 'caveman' | 'ponytail'`
  - `const CHOICES: Record<SelectorKey, { command: string; values: readonly string[] }>` con `model: { command: 'model', values: ['opus','sonnet','haiku'] }`, `effort: { command: 'effort', values: ['low','medium','high','xhigh','max'] }`, `caveman: { command: 'caveman:caveman', values: ['caveman','ultracave','megacave'] }`, `ponytail: { command: 'ponytail:ponytail', values: ['off','lite','full','ultra'] }`
  - `modelName(id: string): string`
  - `costText(usd: number, startedAt: number, now: number): string`
  - `flagValue(raw: string | undefined, allowed: readonly string[]): string`
  - `CAVEMAN_FLAGS`, `PONYTAIL_FLAGS: readonly string[]` (whitelists de «De código»)
- Produce, en `mod/types/index.d.ts`: `PluginState['statusline-controls'] = { open: SelectorKey | null; effort: string; tests: 'passed' | 'failed' | null }`, con atom `{ plugin: 'statusline-controls', key: 'row' }` e inicial `{ open: null, effort: '?', tests: null }`.
- Produce, en `register.tsx`: Buttons con `key` = `model`, `effort`, `caveman`, `ponytail`, `board`; Text del coste con `key="cost"`.

**Ficheros**: crear `.claude-plugin/marketplace.json`, `mod/.claude-plugin/plugin.json`, `mod/hooks/hooks.json`, `mod/hooks/logic.ts`, `mod/hooks/register.tsx`, `mod/types/index.d.ts`, `mod/tests/logic.test.ts`, `mod/tests/row.test.tsx`; modificar `.docs/sdd/constitution.md`, `.docs/sdd/tech-stack.md`, `.docs/sdd/architecture.md`, `.docs/sdd/mission.md`, `CLAUDE.md`.

- [ ] **Step 1: Tests RED** (`import { describe, expect, mock, test } from 'claude-code/testing'`):
  - `logic.test.ts`:
    - `modelName('claude-opus-5-5') === 'Opus 5.5'`, `modelName('claude-haiku-4-5-20251001') === 'Haiku 4.5'`, `modelName('gpt-x') === 'gpt-x'`.
    - `costText(7.5, 0, 30*60000) === '$7.50 · $15.00/h'`, `costText(0.4, 0, 4*60000) === '$0.40'`, `costText(0, 0, 30*60000) === '$0.00'`.
    - `flagValue(undefined, CAVEMAN_FLAGS) === 'off'`, `flagValue('lite\n', PONYTAIL_FLAGS) === 'lite'`, `flagValue('hacked', PONYTAIL_FLAGS) === 'off'`, `flagValue('full'.padEnd(65, ' '), PONYTAIL_FLAGS) === 'off'`.
  - `row.test.tsx`, montando `{ plugin: 'statusline-controls', surface: 'terminal', component: 'PromptHint', props: { isDraft: false, isWorking: false, hint: '? for shortcuts' } }` con `session.model` = `claude-opus-5-5`, `session.usage` = `{ startedAt: 0, cost: { usd: 7.5 } }`, `mock.clock` a 30 min, `env.get` con `HOME=/home/u`, `fs.read` de `/home/u/.claude/.caveman-active` = `caveman` y `.ponytail-active` ausente:
    - `collapsed row shows the six controls in order`: existen las keys `model`, `effort`, `caveman`, `ponytail`, `board`; textos `/🤖 Opus 5.5/`, `/\(medium\)/` tras un `turn.step` con `effort: 'medium'`, `/🗿 caveman/`, `/🦥 off/`, `/💰 \$7\.50 · \$15\.00\/h/`, y el texto `/\? for shortcuts/`.
    - `cost is read on every render`: con `usage` a 7.55 en un segundo montaje sale `/💰 \$7\.55/`.
    - `usage that fails leaves a warning in place of the cost`: `session.usage` deniega → existe `/⚠/` y la key `model`.
    - `usage without cost shows zero`: `usage` = `{ startedAt: 0 }` → `/💰 \$0\.00/` sin `/\/h/`.
    - `model that cannot be read shows a question mark`: `session.model` deniega → `/🤖 \?/`.
    - `a failing render falls back to the engine line`: un `fs.read` que lanza un error no capturable desde el render (p. ej. `env.get` que lanza) → solo el Text del motor de debajo, sin la key `model`.
- [ ] **Step 2: Implementación**:
  - `logic.ts`: las firmas de «Produce». `costText` pinta `$/h` solo con `now - startedAt >= 5*60000` y `usd > 0`; dos decimales.
  - `register.tsx`: `on('turn.step', async function* …)` que guarda `e.effort` en el atom si `e.agentId === undefined`, y `return yield* next(e)`. `on('ui.render', { component: 'PromptHint' }, …).catch(($, e, next) => next(e))` que pinta la fila plegada (forma del spike), el effort en `dimColor`, el modelo en `#c678dd`, el coste en `#d19a66` o `⚠` gris si `usage()` falla, y detrás `<Text dimColor>{e.props.hint}</Text>`. Flags leídos de `<CLAUDE_CONFIG_DIR o home/.claude>/` con `flagValue`; `home` = `HOME` o `USERPROFILE`.
  - Manifiestos: `plugin.json` con `"name": "statusline-controls"`, `"version": "0.1.0"`, `"description"`, `"types": "./types/index.d.ts"`; `marketplace.json` con `"name": "statusline"` y el plugin con `"source": "./mod"`.
  - Docs: enmiendas de la decisión 18 de la spec en `constitution.md`; fila del mod en `tech-stack.md` («Mod» · TypeScript compilado por Claude Code ≥ 2.1.302 · tests con `claude plugin test mod`); sección «Mod de controles» en `architecture.md` (`logic.ts` puro, `register.tsx` con el acceso al motor; enlaza `capabilities/controls.md`); `mission.md` («Producto» menciona el mod); `CLAUDE.md` (forma del proyecto, gate con `claude plugin test mod`, reglas 2 y 3 acotadas a `statusline.js`).
- [ ] **Step 3: Verificación** — `claude plugin validate mod` → `✔ Validation passed`; `claude plugin test mod` → todos en verde.
- [ ] **Step 4: Commit de la task** — `feat(mod): fila plegada de controles con coste en vivo`.

### Task 2 — Selectores

**Modelo**: sesión (Native).
**Tests RED**: hilo principal · `mod/tests/logic.test.ts`, `mod/tests/row.test.tsx`.
**Superficies**: tooling (mod).
**Verificación**: `claude plugin test mod`.
**Se prueba en la aplicación**: con `claude --plugin-dir mod`, pulsar `(medium)` → solo `effort low [medium] high xhigh max ✕`; pulsar `high` → `/effort high` y la fila plegada con `(high)`; `✕` cierra sin comando.

**Interfaces**:
- Consume: `CHOICES`, `SelectorKey`, el atom `row` y las keys de la task 1.
- Produce, en `logic.ts`: `confirmedEffort(response: string): string | undefined` (`/^Set effort level to (\w+)/`), `firstLine(text: string, max = 80): string` (primera línea no vacía, recortada; `ok` si no hay). Keys de opción `<selector>-<valor>` (p. ej. `effort-high`) y `close`.

**Ficheros**: modificar `mod/hooks/logic.ts`, `mod/hooks/register.tsx`, `mod/tests/logic.test.ts`, `mod/tests/row.test.tsx`.

- [ ] **Step 1: Tests RED** (con `command.run` simulado que apunta `/${command} ${args}` y devuelve un `text` fijado por test, y `ui.toast` capturado):
  - `logic.test.ts`: `confirmedEffort('Set effort level to high (saved as your default for new sessions): x') === 'high'`, `confirmedEffort('Kept effort level as medium') === undefined`; `firstLine('\nSet model to `Sonnet 5.5`\nmore') === 'Set model to `Sonnet 5.5`'`, `firstLine('') === 'ok'`, `firstLine('x'.repeat(100)).length === 80`.
  - `row.test.tsx`:
    - `opening a selector hides the rest of the row`: press `effort` → existen `effort-low`…`effort-max` y `close`, no existen `model` ni `board`, y sigue `/\? for shortcuts/`.
    - `picking an option runs the command and folds`: press `effort`, press `effort-high` con respuesta `Set effort level to high (saved as your default for new sessions): …` → `sent` = `['/effort high']`, existe `model` y `/\(high\)/`, el toast contiene `Set effort level to high`.
    - `a change Claude Code keeps out leaves the confirmed effort`: effort `medium`, press `effort-low` con respuesta `Kept effort level as medium` → `/\(medium\)/` y toast `Kept effort level as medium`.
    - `every selector runs its own command`: `model-sonnet` → `/model sonnet`; `caveman-ultracave` → `/caveman:caveman ultracave`; `ponytail-lite` → `/ponytail:ponytail lite`.
    - `a missing command folds and says so`: `command.run` deniega para `ponytail:ponytail` → fila plegada, toast `/ponytail:ponytail is not available`.
    - `close folds without a command`: press `effort`, press `close` → `sent` vacío, `/\(medium\)/`.
    - `pressing the same pill twice closes it`: press `effort` dos veces → `sent` vacío, existe `model`.
    - `the selector stays open when a turn starts`: press `effort`, `turn.step` con `effort: 'medium'` → siguen las keys `effort-*`.
    - `toast shows the first line of the response`: respuesta `'\nline one\nline two'` → toast `line one`.
- [ ] **Step 2: Implementación** — `toggle(key)` y `pick(key, value)` como en el spike: `pick` pone `open: null` en el atom, ejecuta `$.command.run({ command, args })`, y con `effort` guarda `confirmedEffort(text)` si no es `undefined`; toast `firstLine(text)`; si `command.run` rechaza, toast `/<command> is not available`. La opción actual va con `variant: 'primary'`, el resto `plain` + `dimColor`. La forma abierta pinta `effort` (o el nombre del selector), las opciones, `✕` y la pista del motor.
- [ ] **Step 3: Verificación** — `claude plugin test mod` → todos en verde.
- [ ] **Step 4: Commit de la task** — `feat(mod): selectores de modelo, effort, caveman y ponytail`.

### Task 3 — Estado de los tests y Board

**Modelo**: sesión (Native).
**Tests RED**: hilo principal · `mod/tests/logic.test.ts`, `mod/tests/row.test.tsx`.
**Superficies**: tooling (mod).
**Verificación**: `claude plugin test mod`.
**Se prueba en la aplicación**: con `claude --plugin-dir mod`, pedir `node statusline.test.js` → `[passed]` en verde antes de `Board`; pulsar `Board` → se abre el board de ponytail.

**Interfaces**:
- Consume: el atom `row` (`tests`), la key `board`.
- Produce, en `logic.ts`: `isTestCommand(command: string): boolean`, `boardPath(env: { XDG_CONFIG_HOME?: string; HOME?: string; USERPROFILE?: string }): string`. Text del indicador con `key="tests"`.

**Ficheros**: modificar `mod/hooks/logic.ts`, `mod/hooks/register.tsx`, `mod/tests/logic.test.ts`, `mod/tests/row.test.tsx`.

- [ ] **Step 1: Tests RED**:
  - `logic.test.ts`: `isTestCommand` true para `node statusline.test.js`, `npm test`, `git add . && node statusline.test.js`, `Invoke-Pester -CI`, `cd api && python -m pytest -q`; false para `git status`, `npm install`, `node statusline.js`. `boardPath({ HOME: '/home/u' }) === '/home/u/.config/ponytail/band/board.html'`, `boardPath({ USERPROFILE: 'C:\\Users\\u' })` termina en `.config/ponytail/band/board.html`, `boardPath({ XDG_CONFIG_HOME: 'D:\\cfg', HOME: '/home/u' })` empieza por `D:\\cfg` y termina en `ponytail/band/board.html`.
  - `row.test.tsx` (con `tool.call` de Bash simulado que devuelve `isError` según el test):
    - `no tests yet, no indicator`: no existe la key `tests`.
    - `a passing test run shows passed`: `$.tool.call({ tool: 'Bash', command: 'node statusline.test.js' })` sin error → `/\[passed\]/`.
    - `a failing test run shows failed`: `npm test` con `isError: true` → `/\[failed\]/`.
    - `other commands leave the indicator alone`: tras `passed`, `git status` → sigue `/\[passed\]/`.
    - `background runs do not count`: `npm test` con `run_in_background: true` → no existe `tests`.
    - `board opens the file when it exists`: `fs.read` del board con contenido → `process.run` recibe `['cmd','/c','start','', <ruta>]` con `OS=Windows_NT`.
    - `missing board says so`: `fs.read` deniega → no hay `process.run` y el toast dice `ponytail has not generated the board yet`.
- [ ] **Step 2: Implementación** — `isTestCommand`: la expresión de ponytail (`\b(npm (run )?test|pnpm (run )?test|yarn test|bun test|npx (jest|vitest)|jest|vitest|pytest|python3? -m pytest|go test|cargo test|mvn test|gradle test|rspec|phpunit|dotnet test|node --test|deno test|make test)\b`) más `node \S+\.test\.(js|mjs|cjs|ts)\b` e `Invoke-Pester`. `on('tool.call', { tool: 'Bash' }, …)`: `await next(e)`; si `isTestCommand(e.command)`, no es `run_in_background` y no hay `deny`, guarda `passed`/`failed` según `isError`. Board: comprueba que el fichero existe y lo abre con `cmd /c start '' <ruta>` en Windows, `open` en macOS y `xdg-open` en el resto (como ponytail).
- [ ] **Step 3: Verificación** — `claude plugin test mod` → todos en verde.
- [ ] **Step 4: Commit de la task** — `feat(mod): estado de los tests y botón Board`.

### Task 4 — Instalador

**Modelo**: sesión (Native).
**Tests RED**: hilo principal · `statusline.test.js` (bloque del instalador, solo Windows).
**Superficies**: tooling · docs.
**Verificación**: `node statusline.test.js`.
**Se prueba en la aplicación**: `.\install.ps1 -ConfigDir <perfil temporal>` con el `claude` real → «Mod de controles instalado en <perfil>», y una sesión con ese perfil muestra la fila.

**Interfaces**:
- Consume: el plugin `statusline-controls` del marketplace `statusline` (task 1).
- Produce: `install.ps1 -Claude <ruta>` (por defecto `(Get-Command claude -ErrorAction Ignore).Source`).

**Ficheros**: modificar `install.ps1`, `statusline.test.js`, `README.md`, `README.en.md`.

- [ ] **Step 1: Tests RED** en el bloque del instalador, con un CLI falso `fake-claude.cmd` en el temporal del test que escribe `%CLAUDE_CONFIG_DIR%|%*` en `calls.txt` y sale con `%FAKE_CLAUDE_EXIT%`:
  - `install registra el mod en el perfil`: instalación limpia → `calls.txt` tiene dos líneas: `<dir>|plugin marketplace add <raíz del repo>` y `<dir>|plugin install statusline-controls@statusline`; código 0; salida con `Mod de controles instalado`.
  - `update también registra el mod`: segunda ejecución con `settings.json` apuntando al `.cmd` → salida con el aviso de perfil actualizado y `Mod de controles instalado`; dos llamadas más; `settings.json` igual byte a byte.
  - `sin CLI de Claude Code`: `-Claude` a un fichero inexistente → código 0, salida con `no se ha instalado el mod` y los dos comandos manuales; `hooks` con los cuatro ficheros.
  - `fallo de claude plugin`: `FAKE_CLAUDE_EXIT=1` → código distinto de 0, el error nombra `claude plugin marketplace add`, y la salida tiene el bloque `statusLine`.
  - `install con perfil con espacios`: `-ConfigDir` con un espacio → `calls.txt` empieza por la ruta completa.
- [ ] **Step 2: Implementación** — reordenar `install.ps1` para que el camino de update no salga antes del mod (sin `return` temprano); después de la status line, si `-Claude` existe, ejecutar los dos comandos con `$env:CLAUDE_CONFIG_DIR = $ConfigDir` (restaurado al acabar), parar en el primero que salga con código distinto de 0 con `Write-Error` que lo nombra y `exit 1`; sin CLI, `Write-Warning` con los dos comandos manuales. README (castellano e inglés, mismas secciones): sección del mod con qué pinta, la instalación, que `/model` y `/effort` guardan el valor por defecto de las sesiones nuevas, que el mod se lee del clon (moverlo o cambiar de rama lo afecta), `/ponytail band off` para ocultar la banda de ponytail, y el ejemplo de layout de la 0023 como «cuando salga `statusline.json`».
- [ ] **Step 3: Verificación** — `node statusline.test.js` → `statusline.test.js OK`.
- [ ] **Step 4: Commit de la task** — `feat(install): instalar el mod de controles en el perfil`.

---

## Estimación y esfuerzo

- Tipo: frontend
- Esfuerzo spec + plan: 1.5h
- Estimación de implementación: 2.5h (rango 2-3.5h)
- Base de la estimación: 4 tasks; el spike ya resolvió el pintado y los comandos; incertidumbre en el harness de tests del motor (nuevo). Frontend en el log: mediana 0.92.
- Confianza: media

---

## 3. Validación final

- [ ] Gate de cierre, una vez y en el hilo principal: `node statusline.test.js`, `claude plugin validate mod` y `claude plugin test mod`.
- [ ] `install.ps1` con el `claude` real en un perfil temporal, dos veces (idempotencia, decisión 14 de la spec).
- [ ] Coste de la fila igual al `💰` de la status line con la sesión parada, mirado en el terminal.
- [ ] Spec satisfecha: cada requisito tiene su task (ver Self-review).
- [ ] Cierre de rama según el flujo del proyecto (`sdd-end-feature`).

---

## 4. Self-review (cobertura spec → tasks)

- `controls` · Fila plegada → Task 1, `collapsed row shows the six controls in order`. ✓
- `controls` · Nombre del modelo → Task 1, `logic.test.ts` (`modelName`). ✓
- `controls` · Coste en vivo → Task 1, `costText` y `cost is read on every render`. ✓
- `controls` · Abrir un selector → Task 2, `opening a selector hides the rest of the row`, `the selector stays open when a turn starts`. ✓
- `controls` · Elegir una opción → Task 2, `picking an option runs the command and folds`, `every selector runs its own command`. ✓
- `controls` · Elegir con un turno en curso → la cola de `$.command.run`; validación manual (el harness no simula un turno en curso). ✓
- `controls` · Cambio que Claude Code no aplica → Task 2, `a change Claude Code keeps out leaves the confirmed effort`. ✓
- `controls` · Comando que no existe → Task 2, `a missing command folds and says so`. ✓
- `controls` · Cerrar sin elegir → Task 2, `close folds without a command`. ✓
- `controls` · Modos de otros plugins → Task 1, `flagValue` y la fila con `🦥 off`. ✓
- `controls` · Estado de los tests → Task 3. ✓
- `controls` · Board → Task 3. ✓
- `controls` · Un fallo no rompe la línea → Task 1, `usage that fails…`, `a failing render falls back…`. ✓
- `installation` · Instalación del mod / Update / Sin CLI / Fallo → Task 4. ✓
- `installation` · MODIFIED settings.json → Task 4, `update también registra el mod` (`settings.json` igual byte a byte). ✓
- Enmiendas de la constitution, `CLAUDE.md`, docs → Task 1 y Task 4 (README). ✓
- Review Focus → Task 1 (2), Task 2 (2), Task 4 (1). ✓
