# Capacidad — input

## Propósito

De dónde salen los datos de cada refresco: el JSON del stdin, `git`, las variables de entorno y los ficheros flag.

## Requisitos

### Stdin vacío o inválido

- GIVEN un stdin vacío, que no es JSON válido, o un JSON que no es un objeto (`null`, `3`, `"x"`, `[]`)
- WHEN Claude Code ejecuta el statusline
- THEN el statusline pinta sus dos líneas con valores por defecto (modelo `?`, contexto 🟢 0 %, reloj `0m`, coste `$0.00`) y termina sin error

### Campo ausente en el JSON

> Cobertura: con test.

- GIVEN un JSON válido al que le falta un campo que usa un segmento
- WHEN se pinta el statusline
- THEN ese segmento usa su valor por defecto o se omite, y el resto se pinta igual

### Directorio del proyecto

> Cobertura: con test.

- GIVEN un JSON con varios directorios informados
- WHEN el statusline decide sobre qué directorio consultar `git` y qué nombre mostrar
- THEN usa `workspace.project_dir`; si falta, `workspace.current_dir`; si falta, `cwd`

`project_dir` es donde arrancó Claude Code. `current_dir` sigue al cwd de la
shell y cambia durante la sesión.

### Consulta a git

- GIVEN un directorio de proyecto
- WHEN el statusline consulta `git`
- THEN hace como mucho dos llamadas: `rev-parse --path-format=absolute --show-toplevel --git-common-dir --git-dir` y, si la primera da rutas, `status --porcelain=v2 --branch`
- AND cada llamada usa `--no-optional-locks` y descarta stderr
- AND todas las llamadas de un refresco comparten un presupuesto de 2000 ms: cada una tiene como timeout lo que queda, y si no queda nada no se lanza
- AND con un `git` que tarda 1500 ms en dar las rutas y no responde a lo demás, la consulta entera acaba en 2000 ms o menos, no en 5500 ms, y queda marcada como presupuesto agotado
- AND si `git` no existe, falla o el directorio no es un repo, la consulta devuelve vacío y no se propaga ningún error; si agota el presupuesto, devuelve lo que llegó a tiempo y la marca de presupuesto agotado
- AND el statusline completo, lanzado en este repo, termina en menos de 3000 ms

### Lectura de ficheros flag

> Cobertura: con test. El symlink, solo si el sistema deja crearlo.

- GIVEN un fichero flag de otro plugin dentro del perfil (`CLAUDE_CONFIG_DIR`, o `~/.claude` si no está definida)
- WHEN el statusline lo lee
- THEN lo ignora si no existe, si no es un fichero regular, si es un symlink o si pesa más de 64 bytes
- AND solo usa la primera línea, en minúsculas y reducida a los caracteres `a-z`, `0-9` y `-`
- AND el statusline nunca escribe en el perfil

### Saneado del sufijo de ahorro

> Cobertura: con test.

- GIVEN el fichero `.caveman-statusline-suffix` con caracteres de control o secuencias de escape
- WHEN el statusline lo lee
- THEN elimina los caracteres de control antes de pintarlo, de modo que un fichero externo no puede inyectar secuencias ANSI
- AND son caracteres de control los C0 (`U+0000`–`U+001F`, `ESC` incluido), `DEL` (`U+007F`) y los C1 (`U+0080`–`U+009F`, `U+009B` incluido): `A␡B<CSI>31mC` se pinta `AB31mC`

## Reglas de la capacidad

- **Dónde viven los datos**: en ningún sitio propio. Todo se lee en cada ejecución y nada se escribe.
- **Idioma de los nombres**: no aplica.
- **Límites**: 64 bytes por fichero flag; 2000 ms por llamada a `git`.
- **Avisos**: ninguno. Una fuente que falla se trata como dato ausente.
- **Regla ante conflicto**: el stdin manda; `git`, el entorno y los ficheros solo rellenan lo que el JSON no trae. Excepción: el nombre del worktree sale de `git` (ver `session-state.md`).
