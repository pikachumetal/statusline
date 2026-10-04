---
id: 20261004-152728-feature-0001-git-time-budget
feature: 0001
title: Plan de implementación — Presupuesto de tiempo de git y del render
spec: ./spec.md
status: approved
created: 2026-10-04
---

# Plan de implementación — Presupuesto de tiempo de git y del render

## Decisiones que he tomado yo — valida estas

1. Una task, en Native con la sesión. Revisión final con `sdd-kit:effort-medium` + `sonnet`, como en las features anteriores; se confirma al despachar.
2. Ejecución Native: dos funciones del mismo fichero y tres docs.
3. El `git` lento del test es un ejecutor simulado que duerme con `Atomics.wait` (síncrono, sin dependencias): `readGit` es síncrona.
4. Coste: ~0,4 h; una revisión final.
5. Review Focus: 3 entradas; ver la sección.

**Goal**: todo `git` de un refresco cabe en 2000 ms, y un test lo mide.

**Architecture**: `git(args, cwd, timeout)` recibe el timeout. `readGit(data, run = git)` calcula `deadline = Date.now() + 2000` y pasa `deadline - Date.now()` a cada llamada; con 0 o menos, no llama.

**Tech Stack**: Node sin dependencias; tests con `assert` en `statusline.test.js`.

**Spec**: `./spec.md`

**Ejecución**: auto en sdd-kit.json → native, porque es una sola task pequeña. Si esta sesión se retomó tras una compactación (empieza por «This session is being continued from a previous conversation») y quedan dos o más tasks sin su línea `complete` en el ledger, no las hagas tú: despacha las que quedan con subagent-driven-development sobre el mismo ledger. La sesión que ejecuta va bien en gama media (Sonnet, effort medium); el modelo más capaz se reserva para la revisión final.

## Restricciones globales

### De código

- Sin dependencias npm: solo Node y `git`.
- `render` es pura; todo acceso al exterior vive en `readEnv` y en `main`.
- `git` siempre con `--no-optional-locks` y stderr descartado.
- Presupuesto: 2000 ms para todas las llamadas a `git` de un refresco; sin presupuesto, la llamada no se lanza y devuelve `null`.
- Comentarios en español que explican el porqué; sin comentarios que repitan el código ni que citen documentos.

### De proceso

- Tests en RED los escribe el hilo principal (constitution, principio 1).
- Commits: tipo y scope en inglés; título y cuerpo en castellano.

## Review Focus

- `git` que responde rápido a todo → mismo resultado que hoy (`gitNames` + rama) · Task 1, `readGit con git rápido`
- Presupuesto agotado antes de la rama → rama `?`, no `null` ni excepción · Task 1, `readGit con presupuesto agotado`
- Fuera de un repo → `null` en una llamada · cubierto por el render sin git del fixture

---

## Phase -1 — Pre-Implementation Gates

- [x] **Simplicity gate**: un plazo y un parámetro.
- [x] **YAGNI gate**: el ejecutor inyectable tiene un uso real (el test).
- [x] **Brownfield gate**: mismas llamadas a `git`; `readGit(data)` sigue funcionando.
- [x] **Constitution check**: regla 3 se actualiza con la cifra que pedía.

---

## 1. Decisiones técnicas

### 1.1 Estructura de ficheros

**Modificar**:

- `statusline.js` — `git()`, `readGit()`, exports.
- `statusline.test.js` — tests del presupuesto.
- `.docs/sdd/constitution.md`, `.docs/sdd/tech-stack.md`, `.docs/sdd/architecture.md` — la cifra vive en `capabilities/input.md`; estos la enlazan.

### 1.8 Rollout

Directo.

### 1.9 Excepciones a la constitution

Ninguna: la regla 3 pedía fijar la cifra con un test.

---

## 2. Tasks

### Task 1 — Presupuesto compartido de git

**Modelo**: Native (la sesión).
**Tests RED**: hilo principal · `statusline.test.js`, antes del código.
**Superficies**: backend (Node).
**Verificación**: `node statusline.test.js` (imprime `statusline.test.js OK`).
**Se prueba en la aplicación**: no cambia lo que se ve; se comprueba con `node statusline.js` en este repo: misma L1 (`statusline  develop`) en menos de 3 s.

**Interfaces**:
- Consume: `gitNames(top, commonDir, gitDir)`.
- Produce: `readGit(data, run = git)`; `run(args, cwd, timeoutMs)` → `string | null`.

**Ficheros**: modificar `statusline.js`, `statusline.test.js`.

- [ ] **Step 1: Tests RED**:

```js
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const PATHS = '/code/proj\n/code/proj/.git\n/code/proj/.git';
// git que tarda 1500 ms en las rutas y no responde a lo demás.
const slow = (args, cwd, timeout) => { if (args[0] === 'rev-parse' && args.includes('--git-dir')) { sleep(Math.min(1500, timeout)); return timeout >= 1500 ? PATHS : null; } sleep(timeout); return null; };
let t0 = Date.now(); const slowGit = readGit({ cwd: '/code/proj' }, slow);
assert.ok(Date.now() - t0 <= 2150, `readGit con git lento cabe en el presupuesto (${Date.now() - t0} ms)`);
assert.deepStrictEqual(slowGit, { repo: 'proj', worktree: null, branch: '?' }, 'readGit con presupuesto agotado');
const fast = (args) => (args.includes('--git-dir') ? PATHS : args[0] === 'symbolic-ref' ? 'main' : null);
assert.deepStrictEqual(readGit({ cwd: '/code/proj' }, fast), { repo: 'proj', worktree: null, branch: 'main' }, 'readGit con git rápido');
// Render completo en este repo.
t0 = Date.now(); spawnSync(process.execPath, [path.join(__dirname, 'statusline.js')], { input: JSON.stringify({ cwd: __dirname }) });
assert.ok(Date.now() - t0 < 3000, 'statusline completo por debajo de 3000 ms');
```

- [ ] **Step 2: Implementación** — `git(args, cwd, timeout)` usa `timeout` en `execFileSync`. `readGit(data, run = git)`: `deadline = Date.now() + 2000`; `call = (args) => { const left = deadline - Date.now(); return left > 0 ? run(args, cwd, left) : null; }`. Exportar `readGit`.
- [ ] **Step 3: Verificación** — `node statusline.test.js` → `statusline.test.js OK`.
- [ ] **Step 4: Commit de la task** — `perf(statusline): presupuesto de 2 s para todo git de un refresco`.

---

## Estimación y esfuerzo

- Tipo: backend
- Esfuerzo spec + plan: 0,2h
- Estimación de implementación: 0,3h
- Base de la estimación: las 0010–0013 (0,15–0,3h por task)
- Confianza: alta

---

## 3. Validación final

- [ ] Gate de cierre: `node statusline.test.js`.
- [ ] Ejecución real: `node statusline.js` en este repo y medir.
- [ ] Spec satisfecha: cada THEN tiene su assert.
- [ ] Cierre con `sdd-end-feature`.

---

## 4. Self-review (cobertura spec → tasks)

- `--no-optional-locks` y stderr descartado → sin cambio en `git()`; revisión. ✓
- Presupuesto compartido; sin presupuesto no se lanza → `readGit con git lento`, `presupuesto agotado`. ✓
- 1500 ms + sin respuesta → ≤ 2000 ms → `readGit con git lento cabe en el presupuesto` (margen de 150 ms por la planificación del SO). ✓
- Vacío sin error → `presupuesto agotado` (rama `?`). ✓
- Render < 3000 ms → `statusline completo por debajo de 3000 ms`. ✓
