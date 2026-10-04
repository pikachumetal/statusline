---
id: 20261004-203701-feature-0006-failed-segment-mark
feature: 0006
title: Plan de implementación — Marcador ⚠ cuando un segmento falla
spec: ./spec.md
status: approved
created: 2026-10-04
---

# Plan de implementación — Marcador ⚠ cuando un segmento falla

## Decisiones que he tomado yo — valida estas

1. Una task, en Native con la sesión. Revisión final con `sdd-kit:effort-medium` + `sonnet`; se confirma al despachar.
2. La guarda es `segment(fn)`: ejecuta `fn`, devuelve su texto (o `null`) y, si lanza, `FAILED` (`⚠` en gris). `renderLine1` y `renderLine2` la usan en cada segmento.
3. `main` normaliza: `data` que no sea un objeto plano (incluido un array) pasa a `{}`.
4. Coste: ~0,3 h; una revisión final.
5. Review Focus: 3 entradas; ver la sección.

**Goal**: un segmento que falla pinta `⚠` y no tira el statusline.

**Architecture**: `segment(fn)` envuelve cada segmento; `render` sigue pura. `readEnv` no cambia: sus lecturas ya devuelven `null` al fallar.

**Tech Stack**: Node sin dependencias; tests con `assert` en `statusline.test.js`.

**Spec**: `./spec.md`

**Ejecución**: auto en sdd-kit.json → native, porque es una sola task pequeña. Si esta sesión se retomó tras una compactación (empieza por «This session is being continued from a previous conversation») y quedan dos o más tasks sin su línea `complete` en el ledger, no las hagas tú: despacha las que quedan con subagent-driven-development sobre el mismo ledger. La sesión que ejecuta va bien en gama media (Sonnet, effort medium); el modelo más capaz se reserva para la revisión final.

## Restricciones globales

### De código

- Sin dependencias npm: solo Node y `git`.
- `render` y sus `render*` son puras.
- Marcador: `⚠` en gris (`C.gray`), en el sitio del segmento que lanza; un segmento sin datos no lleva `⚠`.
- El statusline no escribe ficheros ni stderr (regla 1 y requisito «Dos líneas»).
- Comentarios en español que explican el porqué; sin comentarios que repitan el código ni que citen documentos.

### De proceso

- Tests en RED los escribe el hilo principal (constitution, principio 1).
- Commits: tipo y scope en inglés; título y cuerpo en castellano.

## Review Focus

- `readEnv` con `project_dir` numérico → no lanza (`git()` ya captura) · Task 1, `project_dir numérico`
- stdin `[]` → `{}`, no un array con propiedades · Task 1, `stdin no objeto`
- Fixture sin fallos → ningún `⚠` · Task 1, `sin fallos no hay marcador`

---

## Phase -1 — Pre-Implementation Gates

- [x] **Simplicity gate**: una guarda y una normalización.
- [x] **YAGNI gate**: `segment` tiene 9 usos.
- [x] **Brownfield gate**: sin fallos, la salida es la de hoy.
- [x] **Constitution check**: principio 3 y regla 4.

---

## 1. Decisiones técnicas

### 1.1 Estructura de ficheros

**Modificar**:

- `statusline.js` — `segment`, `renderLine1`, `renderLine2`, `main`.
- `statusline.test.js` — tests.
- `.docs/sdd/constitution.md` y `.docs/sdd/architecture.md` — al cerrar.

### 1.8 Rollout

Directo.

### 1.9 Excepciones a la constitution

Ninguna.

---

## 2. Tasks

### Task 1 — Guarda por segmento

**Modelo**: Native (la sesión).
**Tests RED**: hilo principal · `statusline.test.js`, antes del código.
**Superficies**: backend (Node).
**Verificación**: `node statusline.test.js` (imprime `statusline.test.js OK`).
**Se prueba en la aplicación**: `{"workspace":{"project_dir":123}}` por stdin pinta `⚠ │ 🤖 ? │ …` y la L2 entera, en vez de no pintar nada.

**Interfaces**:
- Produce: `segment(fn)` → `string | null`.

**Ficheros**: modificar `statusline.js`, `statusline.test.js`.

- [ ] **Step 1: Tests RED**:

```js
const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
const broken = strip(render({ workspace: { project_dir: 123 } }, env, NOW));
assert.ok(broken.split('\n')[0].startsWith('⚠ │ 🤖 ?'), 'segmento que falla pinta ⚠');
assert.ok(broken.split('\n')[1].includes('💰 $0.00'), 'el resto se pinta igual');
assert.ok(!strip(render(fixture, env, NOW)).includes('⚠'), 'sin fallos no hay marcador');
for (const input of ['null', '3', '"x"', '[]', '{"workspace":{"project_dir":123}}']) {
    const out = spawnSync(process.execPath, [script], { input, encoding: 'utf8', timeout: 5000 });
    assert.ok(out.status === 0 && strip(out.stdout).includes('🤖 ?'), `stdin ${input} pinta`);
}
```

- [ ] **Step 2: Implementación** — `segment(fn)` con `try/catch` que devuelve `` `${C.gray}⚠${RESET}` ``; cada `parts.push` de `renderLine1`/`renderLine2` pasa por ella (filtrando `null`). `main`: `if (!data || typeof data !== 'object' || Array.isArray(data)) data = {}`.
- [ ] **Step 3: Verificación** — `node statusline.test.js` → `statusline.test.js OK`.
- [ ] **Step 4: Commit de la task** — `feat(statusline): marcador ⚠ cuando un segmento falla`.

---

## Estimación y esfuerzo

- Tipo: backend
- Esfuerzo spec + plan: 0,2h
- Estimación de implementación: 0,3h
- Base de la estimación: las features de esta release (0,2–0,3h)
- Confianza: alta

---

## 3. Validación final

- [ ] Gate de cierre: `node statusline.test.js`.
- [ ] Ejecución real: stdin con `project_dir: 123` y `null`.
- [ ] Cierre con `sdd-end-feature`.

---

## 4. Self-review (cobertura spec → tasks)

- Stdin no objeto → `stdin null/3/"x"/[] pinta`. ✓
- Segmento que falla → `⚠`, resto igual → `segmento que falla pinta ⚠`, `el resto se pinta igual`. ✓
- Sin datos no es fallo → `sin fallos no hay marcador` y los tests de ausencia vigentes. ✓
