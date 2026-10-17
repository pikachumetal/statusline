---
id: 20261017-215404-patch-0025-cost-to-statusline
task: 0025
title: Patch — el coste sale del mod y toma su color en la status line
type: patch
solution: dev-lead
status: done
created: 2026-10-17
branch: patch/0025-cost-to-statusline
commit:
---

# Patch 0025 — el coste sale del mod y toma su color en la status line

## Capacidades

- Modificadas: `controls` — la fila del mod deja de pintar el coste.
- Modificadas: `output` — el coste pasa de atenuado a `#d19a66`.

## 1. Síntoma

El dev-lead lleva el coste al final de la L1 con `statusline.json` (0023) y la fila del mod lo repite. Petición literal: «quita el coste del mod». Y después: «y podrías poner el color del texto del statusline de los dineros igual que estaba en el mod?».

## 2. Solución fijada

Fijada por el dev-lead, en dos frases:
- «quita el coste del mod»: la fila del mod deja de pintar `💰 $X · $Y/h`.
- «el color del texto del statusline de los dineros igual que estaba en el mod»: el segmento `cost` de la status line se pinta en `#d19a66` (`rgb(209, 154, 102)`), el `color` del `Text` del coste en `mod/hooks/register.tsx`.

**Lo que da por existente, comprobado:**
- el `Box key="cost"` de la fila plegada, con `costText` y `$.session.usage()`;
- `renderCost` en `statusline.js`, hoy con `C.dim`.

## 3. Fix

- **Ficheros:**
  - `mod/hooks/register.tsx`, `mod/hooks/logic.ts`, `mod/tests/row.test.tsx`, `mod/tests/logic.test.ts` y `mod/.claude-plugin/plugin.json`;
  - `statusline.js` y `statusline.test.js`;
  - `README.md`, `README.en.md`, `.docs/sdd/mission.md`, `.docs/sdd/architecture.md` y el Propósito de `.docs/sdd/capabilities/controls.md`.
- **Cambio:**
  - la fila plegada pierde el segmento del coste;
  - `renderCost` pinta con `C.cost = rgb(209, 154, 102)`.
- **Decisiones:**
  - Quitar el coste del mod. — dev-lead
  - Coste de la status line en `#d19a66`. — dev-lead
  - Los procesos que lanza `statusline.test.js` heredan un `CLAUDE_CONFIG_DIR` vacío y temporal. — sin el dev-lead.
    - **Por qué:** con tu `statusline.json` real sin `model`, el test «stdin null pinta» fallaba. El test leía el perfil de quien lo ejecuta.
    - **Alcance:** no cambia lo que el usuario ve, solo aísla el test.
  - En el test de «Color», `💰 $0.47` sale de la lista de atenuados. — sin el dev-lead.
    - **Por qué:** es el requisito que cambia; el assert nuevo fija `#d19a66`.
- **Retirado:**
  - el `Box key="cost"` con su lectura de `$.session.usage()` y de `$.clock.now()` en el render;
  - `costText` y `MIN_RATE_MS` de `logic.ts`;
  - los tests de `costText`, «cost is read on every render», «usage that fails…» y «usage without cost…»;
  - el mock de `session.usage` y las opciones `usd` y `usageFails` del helper de los tests.

  Ninguno tiene otros usos: comprobado con `grep` en `mod/`. `$.clock.now()` sigue en la pausa del selector. `MIN_RATE_MS` de `statusline.js` es otra constante y sigue.

  **Lo que el usuario deja de poder hacer:** nada; deja de ver el coste en la fila del mod, que sigue en la status line.

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | RED antes del fix: el coste en `#d19a66` y la fila sin coste | ✅ los dos fallaban: «coste en #d19a66» y «collapsed row shows the five controls in order» |
| 2 | `node statusline.test.js` tras el fix | ✅ OK |
| 3 | `claude plugin test mod` tras el fix | ✅ 37 pass, 0 fail |
| 4 | `claude plugin validate mod` | ✅ con el aviso de `author`, que ya estaba |

## 5. Tiempo (ligero)

- Estimación: 0.25h
- Real:

## 6. Delta de capacidad

### Capacidad: `controls`

**MODIFIED — Fila plegada**
- GIVEN el mod instalado, la sesión en `claude-opus-5-5` con effort `medium` en el último turno, `.caveman-active` = `caveman` y `.ponytail-active` = `full`
- WHEN Claude Code pinta la línea bajo la status line
- THEN la fila muestra, en este orden, `🤖 Opus 5.5`, `(medium)` en gris, `🗿 caveman`, `🦥 full` y `Board`, y detrás el texto de pista que le pasa el motor
- AND la fila no pinta el coste: está en la status line (segmento `cost`)
- AND el modelo, el effort, caveman, ponytail y Board se pueden pulsar

**REMOVED — Coste en vivo**
- motivo: el coste sale de la fila del mod; lo pinta la status line (`usage.md`, «Coste»).

**MODIFIED — Un fallo no rompe la línea**
- GIVEN un pintado de la fila que falla entero
- WHEN se pinta la línea bajo la status line
- THEN la línea muestra la pista normal del motor, sin controles del mod

**Reglas de la capacidad**
- **Dónde viven los datos**: el mod no escribe ficheros. Lee el modelo de Claude Code (`$.session`), el effort de cada turno y de la respuesta de `/effort`, el resultado de las llamadas a Bash y PowerShell de la sesión, y los modos de `.caveman-active` y `.ponytail-active` en `CLAUDE_CONFIG_DIR`. Lo que recuerda (selector abierto, effort confirmado, último resultado de tests) vive en el estado de sesión de Claude Code y se pierde al cerrarla. Los valores por defecto que guardan `/model` y `/effort` los escribe Claude Code.
- **Límites**: los flags se leen con un máximo de 64 bytes y con whitelist. Un aviso enseña como mucho la primera línea de una respuesta, recortada a 80 caracteres. El texto de los comandos de Bash y PowerShell nunca se pinta.

### Capacidad: `output`

**MODIFIED — Color**

> Cobertura: con test.

- GIVEN un terminal con truecolor
- WHEN se pinta el statusline
- THEN los colores se emiten como secuencias ANSI de 24 bits (`38;2;r;g;b`)
- AND cada fragmento coloreado termina con un reset, de modo que un color no se arrastra al segmento siguiente ni al prompt
- AND el repo va en naranja y negrita; el branch, en verde; el perfil y el modelo, en magenta; el coste, en `#d19a66` (`rgb(209, 154, 102)`); el effort, el sufijo de ahorro, las etiquetas `5h` y `7d` y la hora de reset, atenuados; velocity, en verde lo añadido y en rojo lo eliminado
- AND el color del porcentaje y el gradiente de las barras están en `usage.md`
