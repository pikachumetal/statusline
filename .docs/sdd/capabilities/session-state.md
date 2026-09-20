# Capacidad — session-state

La primera línea (L1): en qué perfil, repo y rama está la sesión, con qué modelo
y con qué modos activos. Los segmentos van separados por `│`, en este orden:
perfil, ubicación, modelo, caveman, ponytail, velocity.

## Requisitos

### Perfil

> Cobertura: sin test.

- GIVEN la variable `CLAUDE_CONFIG_DIR` definida y apuntando a un directorio que no se llama `.claude`
- WHEN se pinta la L1
- THEN el primer segmento es `🧪 <nombre del directorio>`
- AND si la variable no está definida, o el directorio se llama `.claude`, el segmento no aparece

### Ubicación con git

> Cobertura: con test.

- GIVEN un directorio de proyecto dentro de un repo git
- WHEN se pinta la L1
- THEN se muestra el nombre del repo principal (la carpeta que contiene el `.git` común), el icono de branch y el nombre del branch
- AND si el directorio está en un worktree enlazado, se añade `🌳` y el nombre de la carpeta del worktree
- AND dentro de un worktree enlazado el repo sigue siendo el principal, no la carpeta del worktree
- AND el nombre del worktree sale de `git`, no del JSON: el JSON trae el id interno de git (`.git/worktrees/<id>`), que es ilegible si el worktree se movió tras crearse

### Ubicación en detached HEAD

> Cobertura: sin test.

- GIVEN un repo en detached HEAD
- WHEN se pinta la L1
- THEN en lugar del nombre del branch se muestra el hash corto del commit
- AND si tampoco se puede obtener el hash, se muestra `?`

### Ubicación sin git

> Cobertura: con test.

- GIVEN un directorio de proyecto que no es un repo git, o un `git` que no responde
- WHEN se pinta la L1
- THEN se muestra solo el nombre del directorio, sin icono de branch ni worktree

### Modelo y effort

> Cobertura: con test.

- GIVEN un JSON con `model.display_name` y `effort.level`
- WHEN se pinta la L1
- THEN se muestra `🤖 <modelo> (<effort>)`
- AND sin `effort.level` se muestra solo el modelo; sin `model.display_name` se muestra `?`

### Modo caveman

> Cobertura: parcial. Con test el modo y su ocultación; sin test el sufijo de ahorro.

- GIVEN el flag `.caveman-active` con un modo válido
- WHEN se pinta la L1
- THEN se muestra `🗿 <modo>`
- AND si existe `.caveman-statusline-suffix`, su contenido se añade detrás del modo
- AND con `CAVEMAN_STATUSLINE_SAVINGS=0` el sufijo no se muestra

Modos válidos: `lite`, `full`, `ultra`, `wenyan-lite`, `wenyan`, `wenyan-full`,
`wenyan-ultra`, `commit`, `review`, `compress`.

### Modo ponytail

> Cobertura: con test.

- GIVEN el flag `.ponytail-active` con un modo válido
- WHEN se pinta la L1
- THEN se muestra `🦥 <modo>`

Modos válidos: `lite`, `full`, `ultra`, `review`.

### Valor de un flag

> Cobertura: sin test.

- GIVEN un fichero flag que existe
- WHEN su primera línea está vacía
- THEN el modo es `full`
- AND si el valor es `off` o no está en la lista de modos válidos, el segmento no aparece
- AND si el fichero no existe, el segmento no aparece

### Velocity

> Cobertura: con test.

- GIVEN un JSON con `cost.total_lines_added` y `cost.total_lines_removed`
- WHEN al menos uno de los dos es mayor que cero
- THEN se muestra `+<añadidas> -<eliminadas>` como último segmento de la L1
- AND si los dos son cero o faltan, el segmento no aparece

Velocity sale del JSON de la sesión, no de `git`.

## Historial

- 2026-09-20 — patch 0000 (`worktree-name`) — MODIFIED Ubicación con git (antes: el worktree se tomaba del JSON y el repo era la carpeta raíz del árbol de trabajo).
- 2026-09-20 — init — ADDED todos los requisitos. Volcado inicial desde el código, a petición del usuario (excepción a la regla anti-proliferación 4).
