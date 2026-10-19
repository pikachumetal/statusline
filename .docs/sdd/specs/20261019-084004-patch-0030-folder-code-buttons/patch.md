---
id: 20261019-084004-patch-0030-folder-code-buttons
task: 0030
title: Patch — botones folder y code en la fila del mod
type: patch
solution: dev-lead
status: in-progress
created: 2026-10-19
branch: patch/0030-folder-code-buttons
commit:
---

# Patch 0030 — botones folder y code en la fila del mod

## Capacidades

- Modificadas: `controls` — cambia «Fila plegada» y la regla «Avisos»; se añaden «Abrir la carpeta» y «Abrir en VS Code».

## 1. Síntoma

Petición del dev-lead, sobre la idea 4 de las propuestas («`[code]`/`[folder]`: abre el worktree en VS Code o en el Explorador»): «🤖 Opus 5.5 (medium) | (icono) [folder] | (icono) [code] en el icono de vscode, no se si tendras el icono de vscode... mi fuente es Nerd FOnt». Y: «ponles color de carpeta y de code (un azul ...)». Tras verlo: «puedes dejar los demas igual con el [] … 🗿 [caveman] | 🦥 [full] [Board]» y «puede ser clickable solo [folder], lo que esta dentro del []».

## 2. Solución fijada

Fijada por el dev-lead:
- el sitio y el texto: `🤖 Opus 5.5 (medium) | <icono> [folder] | <icono> [code]`, con iconos de Nerd Font;
- el color: «Amarillo carpeta» (`#e5c07b`) para folder, a la pregunta cerrada; azul para code, que la pregunta fijó en el de VS Code (`#007acc`);
- qué abren, de la idea que eligió: la carpeta de la sesión en el explorador y en VS Code;
- el icono o emoji fuera de los corchetes y solo `[…]` clicable, también en caveman y ponytail.

**Lo que da por existente, comprobado:** `$.session.cwd()` y `$.process.run` en la API 2.1.303; los glifos `nf-fa-folder_open` (U+F07C) y `nf-md-microsoft_visual_studio_code` (U+F0A1E) en Nerd Fonts 3.

## 3. Fix

- **Ficheros:** `mod/hooks/register.tsx`, `mod/tests/row.test.tsx`, `README.md` y `README.en.md`.
- **Cambio:**
  - tras `(medium)`: `|`, ` [folder]` en `#e5c07b`, `|` y `󰨞 [code]` en `#007acc`;
  - folder abre `$.session.cwd()` como Board abre su fichero: `cmd /c start "" <dir>` en Windows, `open` en macOS, `xdg-open` en Linux;
  - code lanza `cmd /c code <dir>` en Windows y `code <dir>` fuera;
  - `openBoard` pasa a usar `openWithSystem`, que comparte con folder;
  - el icono de folder y code y el emoji de caveman y ponytail van fuera del botón: solo `[folder]`, `[code]`, `[caveman]` y `[full]` se pulsan.
- **Decisiones:**
  - Sitio, texto, iconos y colores. — dev-lead
  - Solo lo de dentro de los corchetes es clicable; el icono, fuera. — dev-lead
  - El icono lleva el color de su botón. — sin el dev-lead; es el color que pidió para folder y code.
  - El icono del modelo (`🤖`) también queda fuera del botón: solo el nombre se pulsa. — dev-lead: «🤖 Opus 5.5 que el icono no sea clickable».
  - `🧪` delante de `[passed]`/`[failed]`, para que todo lleve icono. — dev-lead pidió el icono («no sé cuál poner»); el `🧪` lo elegí yo porque se ve igual en terminal y escritorio.
  - En el escritorio (addon de VS Code), `📁` y `💻` en vez de los Nerd Font, que su fuente pinta como cajas. — dev-lead, a la pregunta cerrada.
  - La fila ocupa `e.props.bodyColumns`, como la banda de ponytail, y solo sangra en el terminal: con `width="100%"` más la sangría desbordaba la banda del escritorio. — sin el dev-lead; arregla un desbordamiento que el dev-lead vio en su captura.
  - La carpeta es la de la sesión (`$.session.cwd()`), que en un worktree es el worktree. — dev-lead (anunciado antes de su respuesta, sin objeción)
  - Si no arranca, un aviso en inglés: `could not open the folder` / `could not open VS Code`, como los demás avisos del mod. — sin el dev-lead; sigue la regla de idioma de la capacidad.

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | RED: orden y separadores, folder en Windows, code en Windows y fuera, avisos al fallar | ✅ 5 fail |
| 2 | `claude plugin test mod` tras el cambio | ✅ 44 pass, 0 fail; tests RED sin tocar (`git diff --no-index`) |
| 3 | `claude plugin validate mod` | ✅ con el aviso que ya estaba |
| 4 | `node statusline.test.js` | ✅ OK |
| 5 | En una sesión real: `[folder]` abre el Explorador y `[code]` abre VS Code en la carpeta de la sesión | ✅ reportado por el dev-lead: «te confirmo que el folder funciona», y de code, «ahh no ahora sí» |
| 6 | En una sesión real: iconos fuera de los corchetes y solo `[…]` clicable | lo prueba el dev-lead |
| 7 | RED: ancho de la banda (`width: 120`) y emojis en `desktop` | ✅ 1 fail cada uno; después 45 pass, 0 fail |
| 8 | En el addon de VS Code: sin scroll horizontal y con `📁`/`💻` | lo prueba el dev-lead |

## 5. Tiempo (ligero)

- Estimación: 0.5h
- Real: 0.4h

## 6. Delta de capacidad

### Capacidad: `controls`

**MODIFIED — Fila plegada**
- GIVEN el mod instalado, la sesión en `claude-opus-5-5` con effort `medium` en el último turno, `.caveman-active` = `caveman` y `.ponytail-active` = `full`
- WHEN Claude Code pinta la banda sobre el prompt, sin encuesta
- REMOVED THEN la fila muestra a la izquierda `🤖 Opus 5.5` y `(medium)` en gris, y a la derecha, en este orden, `[🗿 caveman]`, `|` en gris, `[🦥 full]` y `[Board]`
- THEN la fila muestra a la izquierda `🤖` y `Opus 5.5`, `(medium)` en gris, `|`, el icono de carpeta y `[folder]` en `#e5c07b`, `|` y el icono de VS Code y `[code]` en `#007acc`; y a la derecha, en este orden, `🗿 [caveman]`, `|` en gris, `🦥 [full]` y `[Board]`
- AND la fila no pinta el coste: está en la status line (segmento `cost`)
- REMOVED AND el modelo, el effort, caveman, ponytail y Board se pueden pulsar
- AND el modelo, el effort, folder, code, caveman, ponytail y Board se pueden pulsar; en folder, code, caveman y ponytail, solo lo que va entre corchetes, no el icono
- AND en el escritorio los iconos de folder y code son `📁` y `💻`, porque su fuente no tiene los de Nerd Font

**ADDED — Abrir la carpeta**
- GIVEN la sesión en `D:\work\app`
- WHEN se pulsa `[folder]`
- THEN se abre `D:\work\app` en el explorador del sistema
- AND si no se puede abrir, un aviso dice `could not open the folder`

**ADDED — Abrir en VS Code**
- GIVEN la sesión en `D:\work\app`
- WHEN se pulsa `[code]`
- THEN se lanza `code D:\work\app`
- AND si `code` no arranca, un aviso dice `could not open VS Code`

**Reglas de la capacidad**
- **Avisos**: solo como respuesta a un clic: la respuesta de cada comando que lanza un selector, el comando que no existe, el Board que falta y la carpeta o VS Code que no se abren. Un dato que falla deja un `⚠` gris en su sitio.

**MODIFIED — Estado de los tests**
- GIVEN una sesión en la que todavía no se ha lanzado ningún test
- WHEN se pinta la fila
- THEN no aparece indicador de tests
- REMOVED AND tras un `node statusline.test.js` por Bash o por PowerShell que sale con 0, aparece `[passed]` en verde al principio del grupo derecho, seguido de `|` en gris antes de `[🗿 …]`
- AND tras un `node statusline.test.js` por Bash o por PowerShell que sale con 0, aparece `🧪 [passed]`, con `[passed]` en verde, al principio del grupo derecho, seguido de `|` en gris antes de `🗿`
- AND tras un `npm test` que sale con 1, cambia a `[failed]` en rojo
- AND un comando compuesto cuenta si alguno de sus tramos separados por `&&`, `||`, `;` o `|` es un test: `git add . && node statusline.test.js` cuenta
- AND un `git status` posterior no lo cambia, ni un test lanzado en segundo plano, cuyo resultado no llega con la llamada
