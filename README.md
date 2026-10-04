# statusline

**Castellano** · [English](README.en.md)

Statusline de dos líneas para Claude Code en Windows. Sin dependencias: solo Node y `git`.

```
EasyClaw  main 🌳 feat-x │ 🤖 Fable 5.1 (medium) │ 🗿 caveman │ 🦥 full │ +156 -23
⏱️ 12m │ 🟡 ████▊█████ 47% │ 🟡 5h ⏳ 1h23m ██┃█████ 34% ↻17:37 │ 🟡 7d ⏳ 6d00h ██████┃█ 38% ↻1d00h │ 💰 $0.47 · $2.35/h
```

## Qué muestra

- **L1**: perfil (`🧪 nombre`, solo si `CLAUDE_CONFIG_DIR` no es el de por defecto), repo, branch y worktree, modelo y effort, modo de caveman y de ponytail, y líneas añadidas y eliminadas en la sesión.
- **L2**: reloj de sesión, contexto, ventana de 5h, ventana semanal y coste.
- **Icono de nivel** en el contexto y en las dos ventanas: 🟢 por debajo del 20 %, 🟡 por debajo del 70 %, 🔥 por debajo del 90 % y 🚨 a partir del 90 %. El porcentaje cambia de color con los mismos cortes.
- **Barras** con gradiente truecolor por posición. La celda de corte se pinta con un sub-bloque (`▏▎▍▌▋▊▉`), así que la barra avanza por octavos de celda.
- **Marcador de ritmo** `┃` en las barras de 5h y semanal: dónde estarías si gastaras la cuota a ritmo constante hasta el reset. Si el relleno pasa de la marca, la cuota se acaba antes que la ventana.
- **Reset** `↻`: la hora local en la ventana de 5h y la cuenta atrás en la semanal.
- **Coste por hora** (`$/h`) a partir de 5 minutos de sesión.
- **Fallos**: un segmento que falla al pintarse deja un `⚠` gris en su sitio y el resto se pinta igual. Un dato que falta no es un fallo: su segmento se omite.

Necesita una terminal con truecolor y una nerd font (el icono de branch es el glifo `U+E0A0`).

## Instalar

```powershell
.\install.ps1                              # ~/.claude
.\install.ps1 -ConfigDir "$HOME\.claude-gco"
```

Copia `statusline.js`, `statusline.cmd`, `statusline-orca.cmd` y `statusline.test.js` a `hooks\` del perfil y muestra el bloque `statusLine` que hay que pegar en `settings.json`. Nunca modifica `settings.json`.

`statusline.cmd` lanza el `node.exe` de la versión más alta instalada con proto, por SemVer, y no su shim. Sin proto, usa el `node` del PATH.

## Actualizar

Ejecuta el mismo comando sobre el mismo perfil: sobrescribe los ficheros y, si `settings.json` ya apunta al statusline, no pide pegar nada.

## Orca

Con Orca instalado (`~\.orca\agent-hooks\claude-statusline.cmd`), el bloque apunta a `statusline-orca.cmd`: pinta este statusline y reenvía el mismo JSON a Orca, que lee `rate_limits` sin pintar nada.

## Test

```
node statusline.test.js
```
