---
id: 20261004-220000-feature-0007-bilingual-readme
feature: 0007
title: Plan de implementación — README bilingüe
spec: ./spec.md
status: approved
created: 2026-10-05
---

# Plan de implementación — README bilingüe

## Decisiones que he tomado yo — valida estas

1. Una task, en Native con la sesión. Revisión final: se propone al dev-lead al despachar, por ser solo documentación.
2. El ejemplo se genera con `render` y el fixture de los tests (caveman `caveman`, git `EasyClaw`/`main`/`feat-x`), sin códigos ANSI. La hora del `↻` de la 5h depende de la zona horaria de quien lo genera.
3. Coste: ~0,3 h.
4. Review Focus: ninguna: comprobado; no cambia comportamiento.

**Goal**: `README.md` al día y `README.en.md` con el mismo contenido en inglés.

**Architecture**: dos ficheros en la raíz, cada uno con el enlace al otro en la primera línea.

**Tech Stack**: Markdown.

**Spec**: `./spec.md`

**Ejecución**: auto en sdd-kit.json → native, porque es una sola task de documentación. Si esta sesión se retomó tras una compactación (empieza por «This session is being continued from a previous conversation») y quedan dos o más tasks sin su línea `complete` en el ledger, no las hagas tú: despacha las que quedan con subagent-driven-development sobre el mismo ledger. La sesión que ejecuta va bien en gama media (Sonnet, effort medium); el modelo más capaz se reserva para la revisión final.

## Restricciones globales

### De código

- Los comandos, rutas y el ejemplo son idénticos en los dos ficheros.
- Ningún valor de comportamiento (umbrales, tiempos) se inventa: sale de `capabilities/`.

### De proceso

- Commits: tipo y scope en inglés; título y cuerpo en castellano.

## Review Focus

- ninguna: comprobado

---

## 1. Decisiones técnicas

### 1.1 Estructura de ficheros

**Crear**: `README.en.md`.
**Modificar**: `README.md`; al cerrar, `.docs/sdd/constitution.md` (regla 2).

### 1.8 Rollout

Directo.

### 1.9 Excepciones a la constitution

Ninguna.

---

## 2. Tasks

### Task 1 — README en dos idiomas

**Modelo**: Native (la sesión).
**Superficies**: docs.
**Verificación**: los umbrales y el ejemplo del README coinciden con `capabilities/` y con `render`; los dos ficheros tienen las mismas secciones (`Select-String '^#'`).
**Se prueba en la aplicación**: no, porque es documentación.

**Ficheros**: crear `README.en.md`, modificar `README.md`.

- [ ] **Step 1: `README.md`** al día: ejemplo real; L1, L2 y avisos según las capacidades; Instalar, Actualizar, Orca y Test.
- [ ] **Step 2: `README.en.md`**: la misma estructura y los mismos bloques, en inglés.
- [ ] **Step 3: Verificación** — secciones iguales y valores contrastados con `capabilities/usage.md` y `session-state.md`.
- [ ] **Step 4: Commit de la task** — `docs(readme): README en castellano e inglés`.

---

## Estimación y esfuerzo

- Tipo: docs
- Esfuerzo spec + plan: 0,1h
- Estimación de implementación: 0,3h
- Base de la estimación: dos ficheros de ~40 líneas
- Confianza: alta

---

## 3. Validación final

- [ ] Gate de cierre: `node statusline.test.js` (sin cambios de código; confirma que nada se rompió).
- [ ] Cierre con `sdd-end-feature`.

---

## 4. Self-review (cobertura spec → tasks)

- Forma en dos ficheros con enlace cruzado → Task 1, Steps 1 y 2. ✓
- README al día → Step 1. ✓
- Mismo contenido en los dos idiomas → Step 3. ✓
