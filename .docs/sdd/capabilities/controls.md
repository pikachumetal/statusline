# Capacidad — controls

## Propósito

La fila clicable que pinta el mod en la banda sobre el prompt, sin tocar la línea de pista del motor: selectores de modelo, effort, caveman y ponytail, estado de los tests y Board. El coste está en la status line (`usage.md`).

## Requisitos

### Fila plegada

- GIVEN el mod instalado, la sesión en `claude-opus-5-5` con effort `medium` en el último turno, `.caveman-active` = `caveman` y `.ponytail-active` = `full`
- WHEN Claude Code pinta la banda sobre el prompt, sin encuesta
- THEN la fila muestra a la izquierda `🤖` y `Opus 5.5`, `(medium)` en gris, `|`, el icono de carpeta y `[folder]` en `#e5c07b`, `|` y el icono de VS Code y `[code]` en `#007acc`; y a la derecha, en este orden, `🗿 [caveman]`, `|` en gris, `🦥 [full]` y `[Board]`
- AND la fila no pinta el coste: está en la status line (segmento `cost`)
- AND el modelo, el effort, folder, code, caveman, ponytail y Board se pueden pulsar; en folder, code, caveman y ponytail, solo lo que va entre corchetes, no el icono
- AND en el escritorio los iconos de folder y code son `📁` y `💻`, porque su fuente no tiene los de Nerd Font

### Nombre del modelo

- GIVEN la sesión en `claude-sonnet-5-5`, o en `claude-haiku-4-5-20251001`
- WHEN se pinta la fila plegada
- THEN el modelo sale como `🤖 Sonnet 5.5`, o como `🤖 Haiku 4.5`
- AND un id que no sigue la forma `claude-<familia>-<mayor>-<menor>` sale tal cual

### Abrir un selector

- GIVEN la fila plegada con effort `medium`
- WHEN se pulsa `(medium)`
- THEN la fila solo muestra `effort`, las opciones `low`, `medium`, `high`, `xhigh` y `max` con `medium` resaltada, y `✕`
- AND el resto de controles del mod no se pinta mientras el selector está abierto
- AND el selector sigue abierto aunque empiece un turno
- AND las opciones de cada selector son: modelo `opus`, `sonnet`, `haiku`; effort `low`, `medium`, `high`, `xhigh`, `max`; caveman `caveman`, `ultracave`, `megacave`; ponytail `off`, `lite`, `full`, `ultra`

### Elegir una opción

- GIVEN el selector de effort abierto con `medium` resaltada
- WHEN se pulsa `high` y `/effort high` responde `Set effort level to high (saved as your default for new sessions): …`
- THEN la fila vuelve a la forma plegada y muestra `(high)`
- AND un aviso enseña la primera línea de la respuesta, recortada a 80 caracteres
- AND con el selector de modelo, pulsar `sonnet` ejecuta `/model sonnet` y la fila plegada muestra `🤖 Sonnet 5.5`
- AND con caveman, `ultracave` ejecuta `/caveman:caveman ultracave`; con ponytail, `lite` ejecuta `/ponytail:ponytail lite`
- AND si se elige con un turno en curso, la fila se pliega al momento y el comando se ejecuta cuando la sesión queda libre

### Cambio que Claude Code no aplica

- GIVEN el selector de effort abierto, con `medium` como effort confirmado
- WHEN se pulsa `low` y `/effort low` responde `Kept effort level as medium`
- THEN la fila vuelve a la forma plegada con `(medium)`
- AND el aviso enseña `Kept effort level as medium`

### Comando que no existe

- GIVEN el plugin ponytail desinstalado
- WHEN se elige `full` en el selector de ponytail
- THEN la fila vuelve a la forma plegada sin cambiar `🦥`
- AND un aviso dice que `/ponytail:ponytail` no está disponible

### Cerrar sin elegir

- GIVEN el selector de effort abierto
- WHEN se pulsa `✕`
- THEN no se ejecuta ningún comando y la fila vuelve a la forma plegada con `(medium)`

### Modos de otros plugins

- GIVEN `.caveman-active` ausente y `.ponytail-active` con `lite`
- WHEN se pinta la fila plegada
- THEN muestra `🗿 off` y `🦥 lite`
- AND un flag con un valor fuera de su whitelist o de más de 64 bytes cuenta como `off`

### Estado de los tests

- GIVEN una sesión en la que todavía no se ha lanzado ningún test
- WHEN se pinta la fila
- THEN no aparece indicador de tests
- AND tras un `node statusline.test.js` por Bash o por PowerShell que sale con 0, aparece `🧪 [passed]`, con `[passed]` en verde, al principio del grupo derecho, seguido de `|` en gris antes de `🗿`
- AND tras un `npm test` que sale con 1, cambia a `[failed]` en rojo
- AND un comando compuesto cuenta si alguno de sus tramos separados por `&&`, `||`, `;` o `|` es un test: `git add . && node statusline.test.js` cuenta
- AND un `git status` posterior no lo cambia, ni un test lanzado en segundo plano, cuyo resultado no llega con la llamada

### Board

- GIVEN `XDG_CONFIG_HOME` sin definir y `<home>/.config/ponytail/band/board.html` existe
- WHEN se pulsa `Board`
- THEN se abre ese fichero en el navegador por defecto
- AND con `XDG_CONFIG_HOME=D:\cfg` se abre `D:\cfg\ponytail\band\board.html`
- AND si el fichero no existe, no se abre nada y un aviso dice que ponytail aún no ha generado el board

### Un fallo no rompe la línea

- GIVEN un pintado de la fila que falla entero
- WHEN se pinta la fila
- THEN la banda queda como la pinta el motor, sin controles del mod

### Encuesta en la banda

- GIVEN una encuesta de Claude Code en la banda sobre el prompt
- WHEN se pinta la banda
- THEN se ve la encuesta y no los controles del mod
- AND los controles vuelven cuando la encuesta deja la banda

### Línea de pista del motor

- GIVEN el mod instalado y dos shells en segundo plano
- WHEN Claude Code pinta la línea de pista bajo el prompt
- THEN la pinta el motor, con su pastilla `2 shells` clicable
- AND el mod no la toca

### Abrir la carpeta

- GIVEN la sesión en `D:\work\app`
- WHEN se pulsa `[folder]`
- THEN se abre `D:\work\app` en el explorador del sistema
- AND si no se puede abrir, un aviso dice `could not open the folder`

### Abrir en VS Code

- GIVEN la sesión en `D:\work\app`
- WHEN se pulsa `[code]`
- THEN se lanza `code D:\work\app`
- AND si `code` no arranca, un aviso dice `could not open VS Code`

## Reglas de la capacidad

- **Dónde viven los datos**: el mod no escribe ficheros. Lee el modelo de Claude Code (`$.session`), el effort de cada turno y de la respuesta de `/effort`, el resultado de las llamadas a Bash y PowerShell de la sesión, y los modos de `.caveman-active` y `.ponytail-active` en `CLAUDE_CONFIG_DIR`. Lo que recuerda (selector abierto, effort confirmado, último resultado de tests) vive en el estado de sesión de Claude Code y se pierde al cerrarla. Los valores por defecto que guardan `/model` y `/effort` los escribe Claude Code.
- **Idioma de los nombres**: en inglés, el texto de la fila y los avisos (`effort`, `Board`, `[passed]`, `[failed]`, `command not available`).
- **Límites**: los flags se leen con un máximo de 64 bytes y con whitelist. Un aviso enseña como mucho la primera línea de una respuesta, recortada a 80 caracteres. El texto de los comandos de Bash y PowerShell nunca se pinta.
- **Avisos**: solo como respuesta a un clic: la respuesta de cada comando que lanza un selector, el comando que no existe, el Board que falta y la carpeta o VS Code que no se abren. Un dato que falla deja un `⚠` gris en su sitio.
- **Regla ante conflicto**: manda Claude Code. El modelo que pinta la fila es el de `$.session.model()`, y el effort, el que Claude Code confirma en la respuesta de `/effort` o en el siguiente turno.
