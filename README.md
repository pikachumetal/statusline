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
- **Marcador de ritmo** `┃` en las barras de 5h y semanal: dónde estarías si gastaras la cuota a ritmo constante hasta el reset. Si el relleno pasa de la marca y sigues a ese ritmo, la cuota se acaba antes que la ventana.
- **Reset** `↻`: la hora local en la ventana de 5h y la cuenta atrás en la semanal.
- **Coste por hora** (`$/h`) a partir de 5 minutos de sesión y con coste mayor que 0.
- **Fallos**: un segmento que falla al pintarse deja un `⚠` gris en su sitio y el resto se pinta igual. Un dato que falta no es un fallo: su segmento se omite.

Necesita una terminal con truecolor y una nerd font (el icono de branch es el glifo `U+E0A0`).

## Instalar

```powershell
.\install.ps1                              # ~/.claude
.\install.ps1 -ConfigDir "$HOME\.claude-gco"
```

Copia `statusline.js`, `statusline.cmd`, `statusline-orca.cmd` y `statusline.test.js` a `hooks\` del perfil y muestra el bloque `statusLine` que hay que pegar en `settings.json`. El instalador nunca edita `settings.json` por su cuenta; el CLI `claude`, al instalar el mod de controles, sí registra el plugin en la configuración del perfil.

`statusline.cmd` lanza el `node.exe` de la versión más alta instalada con proto, por SemVer, y no su shim. Sin proto, usa el `node` del PATH.

## Actualizar

Ejecuta el mismo comando sobre el mismo perfil: sobrescribe los ficheros y, si `settings.json` ya apunta al statusline, no pide pegar nada.

## Orca

Con Orca instalado (`~\.orca\agent-hooks\claude-statusline.cmd`), el bloque apunta a `statusline-orca.cmd`: pinta este statusline, reenvía el mismo JSON a Orca y descarta su salida.

## Mod de controles

Con Claude Code 2.1.302 o superior, `install.ps1` instala también un mod que sustituye la línea de pista bajo la status line por una fila clicable:

```
🤖 Opus 5.5 (medium)  🗿 caveman  🦥 full  💰 $7.50 · $15.00/h  [passed]  Board  (shift+tab to cycle)
```

- **Selectores**: clic en el modelo, el effort, caveman o ponytail despliega sus opciones y oculta el resto de la fila; clic en una opción la aplica con el mismo comando que escribirías (`/model`, `/effort`, `/caveman:caveman`, `/ponytail:ponytail`). `✕` cierra sin cambiar nada.
- **Coste** en vivo, con `$/h` a partir de 5 minutos de sesión.
- **Tests**: `[passed]` en verde o `[failed]` en rojo según el último comando de test de la sesión.
- **Board** abre el board de proyectos de ponytail.

Avisos:

- `/model` y `/effort` guardan el valor elegido como defecto de las sesiones nuevas: lo hace Claude Code.
- Claude Code lee el mod de la carpeta `mod/` del clon. Si mueves o borras el clon, el mod deja de cargar hasta que vuelvas a ejecutar `install.ps1` desde la nueva ruta; si cambias de rama en el clon, cambia el mod de todos los perfiles. Para actualizarlo: `git pull` y `/reload-plugins`.
- Sin el CLI `claude` en el PATH, el instalador lo dice y da los dos comandos para instalarlo a mano.
- La banda de ponytail encima del prompt se oculta con `/ponytail band off`.
- El modelo, el effort, los modos y el coste se ven también en la status line. Para quitarlos de ahí hará falta `statusline.json` (en preparación).

## Test

```
node statusline.test.js
claude plugin test mod
```
