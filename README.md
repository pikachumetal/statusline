# statusline

**Castellano** · [English](README.en.md)

Statusline para Claude Code en Windows: dos líneas por defecto, configurables por perfil. Sin dependencias: solo Node y `git`.

```
EasyClaw  main 🌳 feat-x │ 🤖 Fable 5.1 (medium) │ 🗿 caveman │ 🦥 full │ +156 -23
⏱️ 12m │ 🟡 ████▊█████ 47% │ 🟡 5h ⏳ 1h23m ██┃█████ 34% ↻17:37 │ 🟡 7d ⏳ 6d00h ██████┃█ 38% ↻1d00h │ 💰 $0.47 · $2.35/h
```

## Qué muestra

- **L1** (por defecto): perfil (`🧪 nombre`, solo si `CLAUDE_CONFIG_DIR` no es el de por defecto), repo, branch y worktree, modelo y effort, modo de caveman y de ponytail, y líneas añadidas y eliminadas en la sesión.
- **L2** (por defecto): reloj de sesión, contexto, ventana de 5h, ventana semanal y coste.
- **Icono de nivel** en el contexto y en las dos ventanas: 🟢 por debajo del 20 %, 🟡 por debajo del 70 %, 🔥 por debajo del 90 % y 🚨 a partir del 90 %. El porcentaje cambia de color con los mismos cortes.
- **Barras** con gradiente truecolor por posición. La celda de corte se pinta con un sub-bloque (`▏▎▍▌▋▊▉`), así que la barra avanza por octavos de celda.
- **Marcador de ritmo** `┃` en las barras de 5h y semanal: dónde estarías si gastaras la cuota a ritmo constante hasta el reset. Si el relleno pasa de la marca y sigues a ese ritmo, la cuota se acaba antes que la ventana.
- **Reset** `↻`: la hora local en la ventana de 5h y la cuenta atrás en la semanal.
- **Coste por hora** (`$/h`) a partir de 5 minutos de sesión y con coste mayor que 0.
- **Fallos**: un segmento que falla al pintarse deja un `⚠` gris en su sitio y el resto se pinta igual. Un dato que falta no es un fallo: su segmento se omite.

Necesita una terminal con truecolor y una nerd font (el icono de branch es el glifo `U+E0A0`).

## Configurar las líneas

Cada perfil puede tener su `statusline.json` junto a `settings.json`: en `CLAUDE_CONFIG_DIR` o, sin la variable, en `~/.claude`. Dice qué segmentos se pintan, en qué orden y en cuántas líneas:

```json
{
  "lines": [
    ["duration", "profile", "where", "velocity"],
    ["context", "five_hour", "seven_day"]
  ]
}
```

Cada lista interior es una línea, y sus nombres se pintan en ese orden. Los nombres distinguen mayúsculas:

| Nombre | Pinta |
| --- | --- |
| `profile` | perfil `🧪 nombre` |
| `where` | repo, branch, marcas de git y worktree |
| `model` | modelo y effort |
| `caveman` | modo de caveman y ahorro |
| `ponytail` | modo de ponytail |
| `velocity` | líneas añadidas y eliminadas |
| `duration` | reloj de sesión |
| `context` | contexto |
| `five_hour` | ventana de 5h |
| `seven_day` | ventana semanal |
| `cost` | coste y `$/h` |

- Sin fichero, el layout es el de siempre: las dos líneas de arriba.
- Un segmento sin datos se omite, y una línea que se queda vacía no se pinta. Un nombre repetido se pinta cada vez.
- Un nombre que no existe pinta `⚠` gris en su sitio.
- Un fichero inválido pinta el layout de siempre con un `⚠` gris al final de la L1. Es inválido si:
  - no es JSON;
  - `lines` no es una lista de líneas con al menos un nombre cada una;
  - pasa de 4096 bytes;
  - es un symlink;
  - no es un fichero (un directorio) o no se puede leer.
- Las claves que no son `lines` se ignoran. Un BOM UTF-8 al principio se acepta.
- El instalador nunca crea ni toca `statusline.json`.

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

Con Claude Code 2.1.302 o superior, `install.ps1` instala también un mod que pinta una fila clicable sobre el prompt. La línea de pista de Claude Code sigue igual, con sus pastillas (`2 shells`) clicables. Mientras una encuesta ocupa ese sitio, la fila no se pinta:

```
🤖 Opus 5.5 (medium)  🗿 caveman  🦥 full  [passed]  Board
```

- **Selectores**: clic en el modelo, el effort, caveman o ponytail despliega sus opciones y oculta el resto de la fila; clic en una opción la aplica con el mismo comando que escribirías (`/model`, `/effort`, `/caveman:caveman`, `/ponytail:ponytail`). `✕` cierra sin cambiar nada.
- **Tests**: `[passed]` en verde o `[failed]` en rojo según el último comando de test de la sesión.
- **Board** abre el board de proyectos de ponytail.

Avisos:

- `/model` y `/effort` guardan el valor elegido como defecto de las sesiones nuevas: lo hace Claude Code.
- Claude Code lee el mod de la carpeta `mod/` del clon. Si mueves o borras el clon, el mod deja de cargar hasta que vuelvas a ejecutar `install.ps1` desde la nueva ruta; si cambias de rama en el clon, cambia el mod de todos los perfiles. Para actualizarlo: `git pull` y `/reload-plugins`.
- Sin el CLI `claude` en el PATH, el instalador lo dice y da los dos comandos para instalarlo a mano.
- La banda de ponytail encima del prompt se oculta con `/ponytail band off`.
- El modelo, el effort y los modos se ven también en la status line; para quitarlos de ahí, deja fuera `model`, `caveman` y `ponytail` en `statusline.json`. El coste solo está en la status line (`cost`).

## Test

```
node statusline.test.js
claude plugin test mod
```
