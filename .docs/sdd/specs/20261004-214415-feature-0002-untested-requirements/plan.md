---
id: 20261004-214415-feature-0002-untested-requirements
feature: 0002
title: Plan de implementación — Tests de los requisitos sin cobertura
spec: ./spec.md
status: approved
created: 2026-10-04
---

# Plan de implementación — Tests de los requisitos sin cobertura

## Decisiones que he tomado yo — valida estas

1. Una task, en Native con la sesión. Revisión final con `sdd-kit:effort-medium` + `sonnet`; se confirma al despachar.
2. Sin RED: los tests describen comportamiento existente. Para que no sean tests vacíos, se comprueba con mutaciones del código (romper la regla y ver el test en rojo) en una muestra: hardening de tamaño, saneado del sufijo, precedencia de `project_dir` y detached HEAD.
3. Coste: ~0,5 h; una revisión final.
4. Review Focus: ninguna: comprobado; la feature no añade comportamiento, y la revisión mira si cada THEN quedó cubierto.

**Goal**: cada requisito de la decisión 2 de la spec tiene un assert por THEN.

**Architecture**: un bloque por capacidad en `statusline.test.js`; los que leen el entorno lanzan el script con `CLAUDE_CONFIG_DIR`, `USERPROFILE` y `TEMP` temporales.

**Tech Stack**: Node sin dependencias; `assert`, `child_process`, `fs`.

**Spec**: `./spec.md`

**Ejecución**: auto en sdd-kit.json → native, porque es una sola task de tests. Si esta sesión se retomó tras una compactación (empieza por «This session is being continued from a previous conversation») y quedan dos o más tasks sin su línea `complete` en el ledger, no las hagas tú: despacha las que quedan con subagent-driven-development sobre el mismo ledger. La sesión que ejecuta va bien en gama media (Sonnet, effort medium); el modelo más capaz se reserva para la revisión final.

## Restricciones globales

### De código

- Sin dependencias npm: solo Node y `git`.
- Los tests limpian lo que crean (`fs.rmSync` en `finally`) y no tocan el perfil real del usuario.
- Comentarios en español que explican el porqué; sin comentarios que repitan el código ni que citen documentos.

### De proceso

- Tests escritos por el hilo principal (constitution, principio 1).
- Commits: tipo y scope en inglés; título y cuerpo en castellano.

## Review Focus

- ninguna: comprobado

---

## 1. Decisiones técnicas

### 1.1 Estructura de ficheros

**Modificar**: `statusline.test.js`; al cerrar, las líneas `> Cobertura:` de `capabilities/`.

**NO se tocan**: `statusline.js`, `statusline.cmd`, `statusline-orca.cmd` — la feature no cambia comportamiento.

### 1.8 Rollout

Directo.

### 1.9 Excepciones a la constitution

Ninguna.

---

## 2. Tasks

### Task 1 — Tests de los requisitos sin cobertura

**Modelo**: Native (la sesión).
**Tests**: hilo principal · `statusline.test.js`.
**Superficies**: tooling (tests).
**Verificación**: `node statusline.test.js` (imprime `statusline.test.js OK`).
**Se prueba en la aplicación**: no, porque es un refactor de cobertura: solo añade tests.

**Interfaces**: consume `render`, `readGit`; lanza `statusline.js` y `statusline-orca.cmd`.

**Ficheros**: modificar `statusline.test.js`.

- [ ] **Step 1: Tests**, un bloque por requisito:
  - Perfil: `CLAUDE_CONFIG_DIR` = `<tmp>/statusline-perfil-*` → la L1 empieza por `🧪 statusline-perfil-`; `<tmp>/.claude` → sin `🧪`.
  - Valor de un flag (`.ponytail-active`): vacío → `🦥 full`; `off`, `xyz` o ausente → sin `🦥`.
  - Lectura de ficheros flag: más de 64 bytes → ignorado; una carpeta con el nombre del flag → ignorada; symlink → ignorado (si el sistema deja crearlo); `FULL\nlite` → `🦥 full`; `fu ll!` → `🦥 full`; el perfil no cambia tras pintar.
  - Saneado del sufijo: `.caveman-statusline-suffix` = `\x1b[31mX\x07` → se pinta `X` sin `\x1b[31mX`; con `CAVEMAN_STATUSLINE_SAVINGS=0` → sin `X`.
  - Directorio del proyecto: `render` con `git: null` → `project_dir`, si falta `current_dir`, si falta `cwd`.
  - Detached HEAD: `readGit` con `symbolic-ref` sin respuesta y `rev-parse --short` → `abc1234`.
  - Color del porcentaje: 10/50/80/95 → `80;200;120`/`220;200;0`/`255;140;0`/`220;60;40` delante del porcentaje.
  - Color: todo segmento con un color termina en `\x1b[0m`; repo en negrita y naranja, branch en verde, modelo en magenta.
  - Wrapper de Orca (Windows): el hook falso recibe el JSON, la L1 se pinta, el temporal desaparece, salida 0.
- [ ] **Step 2: Mutaciones** — romper una a una las reglas de la decisión 2 del plan y ver cada test en rojo; deshacer.
- [ ] **Step 3: Verificación** — `node statusline.test.js` → `statusline.test.js OK`.
- [ ] **Step 4: Commit de la task** — `test(statusline): cubrir los requisitos sin test`.

---

## Estimación y esfuerzo

- Tipo: chore
- Esfuerzo spec + plan: 0,2h
- Estimación de implementación: 0,5h
- Base de la estimación: 9 bloques de test, la mitad con proceso lanzado
- Confianza: media

---

## 3. Validación final

- [ ] Gate de cierre: `node statusline.test.js`.
- [ ] Recuento de `> Cobertura:` tras el cierre.
- [ ] Cierre con `sdd-end-feature`.

---

## 4. Self-review (cobertura spec → tasks)

- Cada requisito de la decisión 2 → un bloque del Step 1. ✓
- «Iconos» y «Campo ausente» → sin test nuevo, cobertura real al cerrar (decisión 7 de la spec). ✓
