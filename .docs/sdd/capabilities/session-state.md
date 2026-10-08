# Capacidad — session-state

## Propósito

La primera línea (L1): en qué perfil, repo y rama está la sesión, con qué modelo y con qué modos activos. Los segmentos van separados por `│`, en este orden: perfil, ubicación, modelo, caveman, ponytail, velocity.

## Requisitos

### Perfil

> Cobertura: con test.

- GIVEN la variable `CLAUDE_CONFIG_DIR` definida y apuntando a un directorio que no se llama `.claude`
- WHEN se pinta la L1
- THEN el primer segmento es `🧪 <nombre del directorio>`
- AND si la variable no está definida, o el directorio se llama `.claude`, el segmento no aparece

### Ubicación con git

> Cobertura: con test.

- GIVEN un directorio de proyecto dentro de un repo git
- WHEN se pinta la L1
- THEN se muestra el nombre del repo principal (la carpeta que contiene el `.git` común), el icono de branch y el nombre del branch
- AND si el working tree tiene cambios (modificados, staged, sin seguimiento o en conflicto), tras el branch se añade `●` en amarillo (`220;200;0`): `proj  main ●`
- AND si el branch tiene upstream, tras el branch (y tras `●` si lo hay) se añade en gris atenuado (`130;130;130`) `↑N` con N commits por delante y `↓M` con M por detrás, pegados, solo los que sean mayores que cero: `+2 -1` en `branch.ab` pinta `↑2↓1`, `+2 -0` pinta `↑2`, `+0 -0` no pinta nada
- AND sin upstream, con el upstream borrado o en detached HEAD no se pinta `↑` ni `↓`
- AND si el directorio está en un worktree enlazado, se añade `🌳` y el nombre de la carpeta del worktree, detrás de las marcas: `proj  main ● ↑2 🌳 feat-x`
- AND dentro de un worktree enlazado el repo sigue siendo el principal, no la carpeta del worktree
- AND el nombre del worktree sale de `git`, no del JSON: el JSON trae el id interno de git (`.git/worktrees/<id>`), que es ilegible si el worktree se movió tras crearse
- AND si `git` agota el presupuesto después de dar las rutas, tras el branch se pinta `⚠` en gris en lugar de `●` y `↑↓`, y el branch es `?`: `proj  ? ⚠`
- AND si `git status` falla sin agotar el presupuesto, el branch es `?`, sin `●`, `↑↓` ni `⚠`

### Ubicación en detached HEAD

> Cobertura: con test.

- GIVEN un repo en detached HEAD
- WHEN se pinta la L1
- THEN en lugar del nombre del branch se muestra el hash corto del commit: los 7 primeros caracteres de `branch.oid` (`abc1234def…` pinta `abc1234`)
- AND si tampoco se puede obtener el hash, se muestra `?`

### Ubicación sin git

> Cobertura: con test.

- GIVEN un directorio de proyecto que no es un repo git, o un `git` que falla
- WHEN se pinta la L1
- THEN se muestra solo el nombre del directorio, sin icono de branch, worktree ni `⚠`
- AND si `git` agota el presupuesto antes de dar las rutas, tras el nombre del directorio se pinta `⚠` en gris: `proj ⚠`
- AND sin directorio de proyecto (stdin vacío o inválido) el segmento no aparece, ni su separador

### Modelo y effort

> Cobertura: con test.

- GIVEN un JSON con `model.display_name` y `effort.level`
- WHEN se pinta la L1
- THEN se muestra `🤖 <modelo> (<effort>)`
- AND sin `effort.level` se muestra solo el modelo; sin `model.display_name` se muestra `?`

### Modo caveman

- GIVEN el flag `.caveman-active` con un modo válido
- WHEN se pinta la L1
- THEN se muestra `🗿 <modo>`
- AND los modos válidos son los de caveman 3.x (`caveman`, `ultracave`, `megacave`) y los de 2.x (`lite`, `full`, `ultra`, `wenyan-lite`, `wenyan`, `wenyan-full`, `wenyan-ultra`, `commit`, `review`, `compress`)
- AND si existe `.caveman-statusline-suffix`, su contenido se añade detrás del modo
- AND con `CAVEMAN_STATUSLINE_SAVINGS=0` el sufijo no se muestra

### Modo ponytail

> Cobertura: con test.

- GIVEN el flag `.ponytail-active` con un modo válido
- WHEN se pinta la L1
- THEN se muestra `🦥 <modo>`

Modos válidos: `lite`, `full`, `ultra`, `review`.

### Valor de un flag

> Cobertura: con test.

- GIVEN un fichero flag que existe
- WHEN su primera línea está vacía
- THEN el modo es `full`
- AND si el valor es `off` o no está en la lista de modos válidos, el segmento no aparece
- AND si el fichero no existe, el segmento no aparece

### Velocity

- GIVEN un JSON con `cost.total_lines_added` y `cost.total_lines_removed`
- WHEN al menos uno de los dos es mayor que cero
- THEN se muestra `+<añadidas> -<eliminadas>` como último segmento de la L1
- AND si los dos son cero o faltan, el segmento no aparece
- AND un valor que no sea un número finito y positivo cuenta como 0: `{}` añadidas y 2 eliminadas pintan `+0 -2`
- AND velocity sale del JSON de la sesión, no de `git`
