---
id: 20261004-141040-feature-0010-sub-block-bars
feature: 0010
title: Plan de implementación — Barras con sub-bloques
spec: ./spec.md
status: approved
created: 2026-10-04
---

# Plan de implementación — Barras con sub-bloques

## Decisiones que he tomado yo — valida estas

1. Una sola task, en Native con la sesión. La revisión final de rama va con `sdd-kit:effort-high` + `opus` — es la única revisión independiente de Native.
2. Ejecución Native: una task de ~15 líneas en una función pura; un subagente costaría más que la task.
3. El fondo gris de la celda de corte es `48;2;60;60;60`, el mismo gris (`C.gray`) que las celdas vacías en primer plano.
4. Coste: ~0,5 h; una revisión final (~100k tokens).
5. Review Focus: 4 entradas que la spec no fija con datos (extremos y valores no numéricos), con su comportamiento esperado; ver la sección.

**Goal**: `bar(pct, width)` pinta la celda de corte con un sub-bloque de octavos.

**Architecture**: `bar` calcula los octavos rellenos, pinta las celdas enteras como hoy, la celda de corte con `▏▎▍▌▋▊▉` según el resto y las vacías como hoy. Sigue siendo pura.

**Tech Stack**: Node sin dependencias; tests con `assert` en `statusline.test.js`.

**Spec**: `./spec.md`

**Ejecución**: auto en sdd-kit.json → native, porque es una sola task pequeña en una función pura. Si esta sesión se retomó tras una compactación (empieza por «This session is being continued from a previous conversation») y quedan dos o más tasks sin su línea `complete` en el ledger, no las hagas tú: despacha las que quedan con subagent-driven-development sobre el mismo ledger. La sesión que ejecuta va bien en gama media (Sonnet, effort medium); el modelo más capaz se reserva para la revisión final.

## Restricciones globales

### De código

- Sin dependencias npm: solo Node y `git`.
- `render` y `bar` son puras: sin E/S ni reloj.
- Comentarios en español que explican el porqué; sin comentarios que repitan el código ni que citen documentos (constitution, spec, task, capacidad).
- Sub-bloques, de 1 a 7 octavos: `▏▎▍▌▋▊▉`. Redondeo al octavo más cercano. El ancho de la barra en celdas no cambia.

### De proceso

- Tests en RED los escribe el hilo principal (constitution, principio 1).
- Commits: tipo y scope en inglés; título y cuerpo en castellano.

## Review Focus

- `bar('x', 8)` y `bar(-5, 8)` → 8 celdas vacías, sin sub-bloque · Task 1, `bar acota no numérico y negativo`
- `bar(150, 8)` y `bar(99.9, 8)` → 8 `█` llenos, sin sub-bloque ni celda de más · Task 1, `bar satura sin celda extra`
- `bar(1, 8)` → `▏` en la primera celda y 7 vacías · Task 1, `bar pinta el octavo mínimo`
- Celda de corte tras la última llena (rem > 0 con todas las demás vacías) → el sub-bloque lleva fondo gris · Task 1, `sub-bloque sobre fondo gris`

---

## Phase -1 — Pre-Implementation Gates

- [x] **Simplicity gate**: un cálculo en octavos dentro de `bar`; sin helpers nuevos.
- [x] **YAGNI gate**: sin abstracciones.
- [x] **Brownfield gate**: misma firma `bar(pct, width)`; las tres llamadas no cambian.
- [x] **Constitution check**: principios 1–3 y regla 3 (límites) respetados.

---

## 1. Decisiones técnicas

### 1.1 Estructura de ficheros

**Modificar**:

- `statusline.js` — `bar()`.
- `statusline.test.js` — tests de la barra.

**NO se tocan**:

- `gradientAt`, `C`, los anchos `CONTEXT_WIDTH` y `USAGE_WIDTH` — la spec no cambia colores ni anchos.

### 1.7 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| Una fuente sin los glifos de *Block Elements* | baja | cosmético | Son Unicode estándar; la nerd font ya es requisito y los incluye |

### 1.8 Rollout

Directo: `install.ps1` copia el nuevo `statusline.js`.

### 1.9 Excepciones a la constitution

Ninguna.

---

## 2. Tasks

### Task 1 — Sub-bloques en `bar`

**Modelo**: Native (la sesión).
**Tests RED**: hilo principal · `statusline.test.js`, antes del código.
**Superficies**: backend (Node).
**Verificación**: `node statusline.test.js` (imprime `statusline.test.js OK`, sale con 1 si un assert falla).
**Se prueba en la aplicación**: con el JSON de ejemplo de 34 % en la 5h y 38 % en la semanal, la 5h pinta `██▊` y la semanal `███`, y ambas mantienen 8 celdas.

**Interfaces**:
- Consume: `gradientAt(t)`, `C.gray`, `RESET`, `ESC`, `clamp(n)` de `statusline.js`.
- Produce: `bar(pct, width)` — misma firma; devuelve `width` celdas con ANSI y `RESET` al final.

**Ficheros**: modificar `statusline.js`, `statusline.test.js`.

- [ ] **Step 1: Tests RED** en `statusline.test.js`, con `const cells = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');`:

```js
assert.strictEqual(cells(bar(47, 10)), '████▊█████', '47 % en 10: 4 llenos, ▊, 5 vacíos');
assert.strictEqual(cells(bar(34, 8)), '██▊█████', '34 % en 8: 2 llenos, ▊, 5 vacíos');
assert.strictEqual(cells(bar(38, 8)), '████████', '38 % en 8: 3 llenos, 5 vacíos');
assert.strictEqual((bar(38, 8).match(/38;2;60;60;60m█/g) || []).length, 5, '38 %: 5 vacías grises');
assert.ok(bar(34, 8).includes('48;2;60;60;60m▊'), 'sub-bloque sobre fondo gris');
for (const v of ['x', -5]) assert.strictEqual((bar(v, 8).match(/38;2;60;60;60m█/g) || []).length, 8, `bar acota ${v}`);
for (const v of [150, 99.9]) assert.strictEqual(cells(bar(v, 8)), '████████', `bar satura ${v}`);
assert.strictEqual(cells(bar(1, 8)), '▏███████', 'bar pinta el octavo mínimo');
```

- [ ] **Step 2: Implementación** de `bar(pct, width)` en `statusline.js`: `eighths = Math.round(clamp(pct) / 100 * width * 8)`, `full = Math.floor(eighths / 8)`, `rest = eighths % 8`. Celda `i < full`: `gradientAt(i / (width - 1)) + '█'`; celda `i === full && rest > 0`: fondo gris + `gradientAt(...)` + `'▏▎▍▌▋▊▉'[rest - 1]` + reset del fondo; resto: `C.gray + '█'`.
- [ ] **Step 3: Verificación** — `node statusline.test.js` → `statusline.test.js OK`.
- [ ] **Step 4: Commit de la task** — `feat(statusline): barras con sub-bloques de octavos`.

---

## Estimación y esfuerzo

- Tipo: frontend
- Esfuerzo spec + plan: 0,3h
- Estimación de implementación: 0,3h
- Base de la estimación: una task, una función pura, tests con asserts
- Confianza: alta

---

## 3. Validación final

- [ ] Gate de cierre: `node statusline.test.js`.
- [ ] Ejecución real: pintar el JSON de ejemplo y mirar la L2.
- [ ] Spec satisfecha: cada THEN tiene su assert.
- [ ] Cierre con `sdd-end-feature`.

---

## 4. Self-review (cobertura spec → tasks)

- Número de celdas constante → Task 1, asserts de `cells(...)` con 8 y 10 caracteres. ✓
- Octavos redondeados, 47 %/34 %/38 % → Task 1, tres asserts con esos valores. ✓
- Color por posición → sin cambio en `gradientAt`; lo cubre el test existente `bloque vacío gris` y el de fondo gris. ✓
- Sub-bloque sobre fondo gris, vacías grises → Task 1, `sub-bloque sobre fondo gris` y `5 vacías grises`. ✓
- Acotado 0–100 → Task 1, `bar acota` y `bar satura`. ✓
