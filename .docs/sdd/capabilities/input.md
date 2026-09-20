# Capacidad — input

De dónde salen los datos de cada refresco: el JSON del stdin, `git`, las
variables de entorno y los ficheros flag. Las reglas generales están en
`constitution.md`; aquí está el comportamiento observable.

## Requisitos

### Stdin vacío o inválido

> Cobertura: sin test.

- GIVEN un stdin vacío o que no es JSON válido
- WHEN Claude Code ejecuta el statusline
- THEN el statusline pinta sus dos líneas con valores por defecto (modelo `?`,
  contexto 🟢 0 %, reloj `0m`, coste `$0.00`) y termina sin error

### Campo ausente en el JSON

> Cobertura: parcial. Los tests cubren la ausencia de velocity y de `git`.

- GIVEN un JSON válido al que le falta un campo que usa un segmento
- WHEN se pinta el statusline
- THEN ese segmento usa su valor por defecto o se omite, y el resto se pinta igual

### Directorio del proyecto

> Cobertura: parcial. Los tests solo ejercitan `current_dir`.

- GIVEN un JSON con varios directorios informados
- WHEN el statusline decide sobre qué directorio consultar `git` y qué nombre mostrar
- THEN usa `workspace.project_dir`; si falta, `workspace.current_dir`; si falta, `cwd`

`project_dir` es donde arrancó Claude Code. `current_dir` sigue al cwd de la
shell y cambia durante la sesión.

### Consulta a git

> Cobertura: sin test.

- GIVEN un directorio de proyecto
- WHEN el statusline consulta `git`
- THEN cada llamada usa `--no-optional-locks`, descarta stderr y tiene un timeout de 2000 ms
- AND si `git` no existe, falla, tarda más que el timeout o el directorio no es un repo, la consulta devuelve vacío y no se propaga ningún error

### Lectura de ficheros flag

> Cobertura: sin test.

- GIVEN un fichero flag de otro plugin dentro del perfil (`CLAUDE_CONFIG_DIR`, o `~/.claude` si no está definida)
- WHEN el statusline lo lee
- THEN lo ignora si no existe, si no es un fichero regular, si es un symlink o si pesa más de 64 bytes
- AND solo usa la primera línea, en minúsculas y reducida a los caracteres `a-z`, `0-9` y `-`
- AND el statusline nunca escribe en el perfil

### Saneado del sufijo de ahorro

> Cobertura: sin test.

- GIVEN el fichero `.caveman-statusline-suffix` con caracteres de control o secuencias de escape
- WHEN el statusline lo lee
- THEN elimina los caracteres de control antes de pintarlo, de modo que un fichero externo no puede inyectar secuencias ANSI

## Reglas de la capacidad

- **Dónde viven los datos**: en ningún sitio propio. Todo se lee en cada ejecución y nada se escribe.
- **Idioma de los nombres**: no aplica.
- **Límites**: 64 bytes por fichero flag; 2000 ms por llamada a `git`.
- **Avisos**: ninguno. Una fuente que falla se trata como dato ausente.
- **Regla ante conflicto**: el stdin manda; `git`, el entorno y los ficheros solo rellenan lo que el JSON no trae.

## Historial

- 2026-09-20 — init — ADDED todos los requisitos. Volcado inicial desde el código, a petición del usuario (excepción a la regla anti-proliferación 4).
