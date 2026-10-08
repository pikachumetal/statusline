---
id: 20261008-141230-feature-0012-git-status-l1
feature: 0012
title: Plan de implementación — Estado de git en la L1
spec: ./spec.md
status: approved
created: 2026-10-08
---

# Plan de implementación — Estado de git en la L1

## Decisiones que he tomado yo — valida estas

1. Modelo y effort: el hilo principal implementa las dos tasks (Native); el revisor final de rama, `sdd-kit:effort-high` + `opus`, como pide el kit para Native. Un solo revisor, sin paralelizar.
2. Ejecución: Native — dos tasks pequeñas y encadenadas (la segunda pinta lo que devuelve la primera) sobre un solo fichero; un subagente por task costaría más contexto que el código.
3. Forma de lo que devuelve `readGit`: `{ repo, worktree, branch, dirty, ahead, behind, timedOut }`; con el presupuesto agotado en las rutas, `{ timedOut: true }`; sin repo o con `git` fallando en las rutas, `null`.
4. El presupuesto agotado se detecta en `call` (la clausura de `readGit`): `null` con `Date.now() >= deadline` o llamada no lanzada. El ejecutor inyectable no cambia de contrato.
5. Riesgo: `execFileSync` tiene `maxBuffer` de 1 MB; un `status` con decenas de miles de entradas falla y la rama sale `?`. Se acepta con un comentario `ponytail:` en `readGit`.
6. Coste: ~1 h de implementación; revisor final opus, del orden de 100k tokens.
7. Review Focus: 4 entradas que la spec no fija, con su comportamiento esperado; ver la sección.

**Goal**: pintar `●` y `↑N↓M` junto a la rama, con dos llamadas a `git` en lugar de tres, y `⚠` si `git` agota el presupuesto.

**Architecture**: `readGit` cambia `symbolic-ref` y `rev-parse --short` por un `git status --porcelain=v2 --branch` que parsea una función pura nueva. `renderWhere` pinta las marcas a partir de lo que trae `env.git`; `render` sigue pura.

**Tech Stack**: Node CommonJS sin dependencias, `git` ≥ 2.31, tests con `assert` (`node statusline.test.js`).

**Spec**: `./spec.md`

**Ejecución**: native, porque son dos tasks encadenadas sobre un fichero y el diseño ya está en el plan. Si esta sesión se retomó tras una compactación (empieza por «This session is being continued from a previous conversation») y quedan dos o más tasks sin su línea `complete` en el ledger, no las hagas tú: despacha las que quedan con subagent-driven-development sobre el mismo ledger. La sesión que ejecuta va bien en gama media (Sonnet, effort medium); el modelo más capaz se reserva para la revisión final.

## Restricciones globales

### De código

- Sin dependencias npm: solo Node y `git`. El statusline no escribe ficheros.
- `render` es pura: no lee ficheros, no llama a `git` ni consulta el reloj. Todo acceso al exterior vive en `readEnv`, `readGit` y `main`.
- Cada llamada a `git` usa `--no-optional-locks`, descarta stderr y comparte el presupuesto de 2000 ms (`GIT_BUDGET_MS`).
- El statusline nunca rompe: sin repo, sin upstream o con `git` fallando, la L1 se pinta igual.
- Colores: `●` con `C.yellow` (`220;200;0`); `↑N↓M` con `C.dim` (`130;130;130`); `⚠` es la constante `FAILED` existente.
- Comentarios en castellano que explican el porqué; sin comentarios que repitan el código ni que citen la constitution, la spec o la capacidad. Funciones de ~20 líneas como umbral de alerta.

### De proceso

- Tests en RED los escribe el hilo principal; `node statusline.test.js` pasa antes de cada commit.
- Commits: tipo/scope en inglés, título y cuerpo en castellano, con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

- Upstream borrado (`# branch.upstream` sin `# branch.ab`) → sin `↑↓`, sin error · Task 1, `parseStatus upstream borrado`
- Rama sin commits (`# branch.oid (initial)` con `# branch.head main`) → rama `main`, no `?` ni `(initial)` · Task 1, `parseStatus rama sin commits`
- Línea `branch.ab` con ruido (CRLF de git en Windows) → contadores numéricos correctos · Task 1, `parseStatus con CRLF`
- `env.git` antiguo sin `dirty`/`ahead`/`behind` (fixtures de los tests de hoy) → rama sin marcas · Task 2, el test existente `git falta …` sigue verde

---

## Phase -1 — Pre-Implementation Gates

- [x] **Simplicity gate**: una función de parseo pura y tres líneas de render.
- [x] **YAGNI gate**: sin opciones de color ni de iconos.
- [x] **Brownfield gate**: `readGit` conserva firma `(data, run = git)`; los fixtures `env.git` antiguos siguen pintando.
- [x] **Constitution check**: reglas 1-4 de principios y reglas de producto 1, 3 y 4.

---

## 1. Decisiones técnicas

### 1.1 Estructura de ficheros

**Modificar**:

- `statusline.js` — `readGit` (dos llamadas, marca de presupuesto), nueva `parseStatus`, `renderWhere`.
- `statusline.test.js` — tests de las dos tasks; se reescriben los de presupuesto y detached HEAD que simulaban `symbolic-ref`/`rev-parse --short`.

**NO se tocan**:

- `git()` — sigue devolviendo texto o `null`.
- `gitNames` — las rutas siguen saliendo de `rev-parse`.

### 1.7 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| `git status` lento en repos grandes con muchos ficheros sin seguimiento | media | `⚠` en lugar de las marcas | presupuesto de 2000 ms; se ve |
| `status` de más de 1 MB (`maxBuffer`) | baja | rama `?` | comentario `ponytail:` |

### 1.8 Rollout

Directo: entra en la release 2.0.0.

### 1.9 Excepciones a la constitution

Ninguna.

---

## 2. Tasks

### Task 1 — `readGit` con `git status --porcelain=v2 --branch`

**Modelo**: hilo principal (Native).
**Tests RED**: hilo principal · `statusline.test.js`.
**Superficies**: backend (script Node).
**Verificación**: `node statusline.test.js`
**Se prueba en la aplicación**: no, porque es la base que pinta la Task 2: `readGit` ya devuelve el estado pero la L1 aún no lo muestra.

**Interfaces**:
- Consume: `git(args, cwd, timeout)` → `string | null`; `gitNames(top, commonDir, gitDir)`.
- Produce: `parseStatus(text: string) → { branch: string, dirty: boolean, ahead: number|null, behind: number|null }` (exportada); `readGit(data, run = git)` → `{ repo, worktree, branch, dirty, ahead, behind, timedOut }` | `{ timedOut: true }` | `null`.

**Ficheros**: modificar `statusline.js`, `statusline.test.js`.

- [ ] **Step 1: Tests RED** (`STATUS` es una salida de `status` con `\n`):
  - `parseStatus` con `# branch.oid abc1234def\n# branch.head main\n# branch.upstream origin/main\n# branch.ab +2 -1\n1 .M N... …\n` → `{ branch: 'main', dirty: true, ahead: 2, behind: 1 }`.
  - limpia y al día (`+0 -0`, sin entradas) → `{ branch: 'main', dirty: false, ahead: 0, behind: 0 }`.
  - solo sin seguimiento (`? u.txt`) → `dirty: true`; en conflicto (`u UU …`) → `dirty: true`.
  - detached (`# branch.head (detached)`, oid `abc1234def…`) → `branch: 'abc1234'`, `ahead: null`, `behind: null`.
  - sin upstream → `ahead: null, behind: null`; upstream borrado (`branch.upstream` sin `branch.ab`) → igual.
  - rama sin commits (`# branch.oid (initial)\n# branch.head main`) → `branch: 'main'`.
  - con CRLF → mismos contadores.
  - `readGit` con git rápido (rutas + `status`) → `{ repo: 'proj', worktree: null, branch: 'main', dirty: true, ahead: 2, behind: 1, timedOut: false }`; y comprueba que solo se lanzan dos llamadas, la segunda `['status', '--porcelain=v2', '--branch']`.
  - `readGit` con `status` que falla (`null` dentro de plazo) → `branch: '?'`, `dirty: false`, `ahead: null`, `behind: null`, `timedOut: false`.
  - presupuesto (sustituye al de hoy): rutas en 1500 ms y `status` sin respuesta → `took <= 2500` y `{ repo: 'proj', worktree: null, branch: '?', dirty: false, ahead: null, behind: null, timedOut: true }`.
  - rutas que agotan el presupuesto (`sleep(timeout)`, `null`) → `{ timedOut: true }`.
  - rutas que fallan rápido → `null`.
  - detached HEAD (sustituye al de hoy): el `status` simulado da el hash; sin `status`, `?`.
- [ ] **Step 2: Implementación** — `parseStatus` en `statusline.js`, junto a `gitNames`; `readGit` con la marca `timedOut` en `call` y comentario `ponytail:` sobre `maxBuffer`.
- [ ] **Step 3: Verificación** — `node statusline.test.js` sale con 0.
- [ ] **Step 4: Commit de la task** — `feat(statusline): leer el estado de git con un solo git status`.

### Task 2 — Marcas en la L1

**Modelo**: hilo principal (Native).
**Tests RED**: hilo principal · `statusline.test.js`.
**Superficies**: backend (script Node).
**Verificación**: `node statusline.test.js`
**Se prueba en la aplicación**: en este worktree con un fichero sin commitear, la L1 de Claude Code muestra `statusline  feature/0012-git-status-l1 ● 🌳 feature-0012-git-status-l1`; con `git commit` y sin push, `↑1`.

**Interfaces**:
- Consume: `env.git` con la forma de la Task 1.
- Produce: nada.

**Ficheros**: modificar `statusline.js` (`renderWhere`), `statusline.test.js`.

- [ ] **Step 1: Tests RED** (sobre `cells(render(...).split('\n')[0])` y el ANSI crudo):
  - `{ repo: 'proj', branch: 'main', worktree: null, dirty: true, ahead: 2, behind: 1 }` → L1 empieza por `proj  main ● ↑2↓1 │`; el crudo contiene `\x1b[38;2;220;200;0m●` y `\x1b[38;2;130;130;130m↑2↓1`.
  - `ahead: 2, behind: 0` → `↑2` sin `↓`; `0/0` → sin flechas; `null/null` → sin flechas; `dirty: false` → sin `●`.
  - con worktree: `proj  main ● ↑2 🌳 feat-x`.
  - `{ repo: 'proj', branch: '?', worktree: null, timedOut: true }` → `proj  ? ⚠ │`.
  - `{ timedOut: true }` con `cwd: '/code/proj'` → L1 empieza por `proj ⚠ │`.
  - `null` → `proj │` sin `⚠` (el test de «Ubicación sin git» de hoy sigue verde).
  - el test de color «segmento sin reset final» con un `env.git` que lleva las tres marcas.
- [ ] **Step 2: Implementación** — `renderWhere(data, env)`: nombre desde `env.git?.repo` o el directorio; `⚠` (`FAILED`) si `timedOut`; si no, `●` y flechas.
- [ ] **Step 3: Verificación** — `node statusline.test.js` sale con 0.
- [ ] **Step 4: Commit de la task** — `feat(statusline): pintar cambios y ahead/behind junto a la rama`.

---

## Estimación y esfuerzo

- Tipo: backend
- Esfuerzo spec + plan: 0.5h
- Estimación de implementación: 1h
- Base de la estimación: 2 tasks en un fichero; mediana backend del log 1.08; la 0001, que tocó `readGit`, es la referencia.
- Confianza: media

---

## 3. Validación final

- [ ] Gate de cierre, una vez y en el hilo principal: `node statusline.test.js`
- [ ] Smoke: el statusline lanzado en este worktree con un fichero sin commitear, y en un repo temporal con upstream por delante y por detrás.
- [ ] Spec satisfecha: cada requisito tiene su task
- [ ] Cierre con `sdd-end-feature`

---

## 4. Self-review (cobertura spec → tasks)

- `input` «Consulta a git»: dos llamadas, presupuesto, marca de agotado, vacío al fallar, <3000 ms → Task 1. ✓
- `session-state` «Ubicación con git»: `●`, `↑↓`, orden, `⚠` tras la rama, `status` que falla → Task 1 (datos) y Task 2 (pintado). ✓
- «Ubicación en detached HEAD»: 7 caracteres de `branch.oid`, `?` → Task 1. ✓
- «Ubicación sin git»: sin `⚠` al fallar, `proj ⚠` al agotar en rutas → Task 2. ✓
- Review Focus: upstream borrado, rama sin commits, CRLF → Task 1; fixtures antiguos → Task 2. ✓
- Cada escenario tiene su task: comprobado (unattended, sin gate de plan).
