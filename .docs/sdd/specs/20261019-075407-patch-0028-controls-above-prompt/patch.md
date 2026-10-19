---
id: 20261019-075407-patch-0028-controls-above-prompt
task: 0028
title: Patch — los controles del mod pasan a la banda sobre el prompt
type: patch
solution: dev-lead
status: in-progress
created: 2026-10-19
branch: patch/0028-controls-above-prompt
commit:
---

# Patch 0028 — los controles del mod pasan a la banda sobre el prompt

## Capacidades

- Modificadas: `controls` — la fila del mod se pinta en la banda sobre el prompt y deja la línea de pista al motor.

## 1. Síntoma

Con el mod instalado, la pastilla «2 shells» de la línea de pista deja de ser clicable. Pregunta literal del dev-lead: «Normalmente en shell era clickable, esto es por alguna cosa con el mod?».

## 2. Solución fijada

El mod pinta su fila con `ui.render` sobre `PromptHint` y copia `e.props.hint` como `Text`. Según la API de Claude Code 2.1.303, un árbol propio en `PromptHint` sustituye la línea del motor y apaga sus pastillas. `tail` las mantiene vivas, pero solo admite texto.

De las tres opciones presentadas, el dev-lead eligió la 1: «la 1, métele un patch». Los controles se pintan con `ui.render` sobre `AbovePrompt`, la banda sobre el prompt, que admite botones. `PromptHint` queda para el motor. Mientras una encuesta ocupa la banda (`hasSurvey`), el mod devuelve `next(e)`.

**Lo que da por existente, comprobado:** el componente `AbovePrompt`, con `hasSurvey`, en `claude-code.d.ts` de 2.1.303.

## 3. Fix

- **Ficheros:**
  - `mod/hooks/register.tsx`, `mod/tests/row.test.tsx` y la descripción de `mod/.claude-plugin/plugin.json`;
  - `README.md`, `README.en.md`, `.docs/sdd/architecture.md` y el Propósito de `.docs/sdd/capabilities/controls.md`.
- **Cambio:**
  - el hook pasa de `PromptHint` a `AbovePrompt` y cede ante una encuesta;
  - la fila deja de repetir el texto de pista;
  - la fila se sangra 2 columnas (`paddingLeft`), como la status line y la línea de pista.
- **Decisiones:**
  - Controles en `AbovePrompt`. — dev-lead
  - Con una encuesta en la banda, el mod no pinta nada. — dev-lead (opción 1 tal como se presentó: «comparten banda con las encuestas»)
  - La fila ya no lleva el texto de pista detrás: el motor lo pinta en su línea. — dev-lead (opción 1: «`PromptHint` vuelve a ser del motor»)
  - Sangría de 2 columnas para alinear la fila con la status line. — dev-lead: «se puede poner a la misma altura?». El 2 lo medí en su captura; la API no publica la sangría del motor.
- **Retirado:** la variable `hint` del render. No tiene otros usos en `mod/`.

  **Lo que el usuario deja de poder hacer:** nada; los controles cambian de sitio y la pastilla «N shells» vuelve a responder al clic.

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | RED: tests sobre `AbovePrompt`, la encuesta y `PromptHint` del motor, antes del cambio | ✅ 19 fail |
| 2 | `claude plugin test mod` tras el cambio | ✅ 39 pass, 0 fail; tests RED sin tocar (`git diff --no-index`) |
| 3 | `claude plugin validate mod` | ✅ con el aviso que ya estaba |
| 4 | `node statusline.test.js` | ✅ OK |
| 5 | En una sesión real tras `/reload-plugins`: la fila sobre el prompt y «N shells» clicable | lo prueba el dev-lead |

## 5. Tiempo (ligero)

- Estimación: 0.25h
- Real: 0.3h

## 6. Delta de capacidad

### Capacidad: `controls`

**MODIFIED — Fila plegada**
- GIVEN el mod instalado, la sesión en `claude-opus-5-5` con effort `medium` en el último turno, `.caveman-active` = `caveman` y `.ponytail-active` = `full`
- REMOVED WHEN Claude Code pinta la línea bajo la status line
- WHEN Claude Code pinta la banda sobre el prompt, sin encuesta
- REMOVED THEN la fila muestra, en este orden, `🤖 Opus 5.5`, `(medium)` en gris, `🗿 caveman`, `🦥 full` y `Board`, y detrás el texto de pista que le pasa el motor
- THEN la fila muestra, en este orden, `🤖 Opus 5.5`, `(medium)` en gris, `🗿 caveman`, `🦥 full` y `Board`
- AND la fila no pinta el coste: está en la status line (segmento `cost`)
- AND el modelo, el effort, caveman, ponytail y Board se pueden pulsar

**MODIFIED — Abrir un selector**
- GIVEN la fila plegada con effort `medium`
- WHEN se pulsa `(medium)`
- REMOVED THEN la fila solo muestra `effort`, las opciones `low`, `medium`, `high`, `xhigh` y `max` con `medium` resaltada, y `✕`, y detrás el texto de pista que le pasa el motor
- THEN la fila solo muestra `effort`, las opciones `low`, `medium`, `high`, `xhigh` y `max` con `medium` resaltada, y `✕`
- AND el resto de controles del mod no se pinta mientras el selector está abierto
- AND el selector sigue abierto aunque empiece un turno
- AND las opciones de cada selector son: modelo `opus`, `sonnet`, `haiku`; effort `low`, `medium`, `high`, `xhigh`, `max`; caveman `caveman`, `ultracave`, `megacave`; ponytail `off`, `lite`, `full`, `ultra`

**MODIFIED — Un fallo no rompe la línea**
- GIVEN un pintado de la fila que falla entero
- WHEN se pinta la fila
- REMOVED THEN la línea muestra la pista normal del motor, sin controles del mod
- THEN la banda queda como la pinta el motor, sin controles del mod

**ADDED — Encuesta en la banda**
- GIVEN una encuesta de Claude Code en la banda sobre el prompt
- WHEN se pinta la banda
- THEN se ve la encuesta y no los controles del mod
- AND los controles vuelven cuando la encuesta deja la banda

**ADDED — Línea de pista del motor**
- GIVEN el mod instalado y dos shells en segundo plano
- WHEN Claude Code pinta la línea de pista bajo el prompt
- THEN la pinta el motor, con su pastilla `2 shells` clicable
- AND el mod no la toca
