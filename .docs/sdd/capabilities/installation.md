# Capacidad — installation

Cómo llega el statusline a un perfil de Claude Code y cómo se lanza. Solo
Windows tiene instalador y lanzador.

## Requisitos

### Copia de ficheros al perfil

> Cobertura: sin test.

- GIVEN el repo clonado en una máquina Windows con PowerShell 7+
- WHEN se ejecuta `.\install.ps1`, con o sin `-ConfigDir <perfil>`
- THEN `statusline.js`, `statusline.cmd` y `statusline.test.js` se copian a `<perfil>\hooks`
- AND el perfil por defecto es `~/.claude`
- AND la carpeta `hooks` se crea si no existe, y los ficheros que ya hubiera se sobrescriben

### El instalador no toca settings.json

> Cobertura: sin test.

- GIVEN una instalación en un perfil
- WHEN `install.ps1` termina
- THEN muestra por pantalla el bloque `statusLine` que hay que pegar en `<perfil>\settings.json`, con la ruta del `.cmd` ya escapada, `padding: 0` y `refreshInterval: 10`
- AND no crea ni modifica `settings.json`

### Lanzador

> Cobertura: sin test.

- GIVEN `statusline.cmd` y `statusline.js` en la misma carpeta
- WHEN Claude Code ejecuta `statusline.cmd`
- THEN si existe `%USERPROFILE%\.proto\tools\node`, lanza `statusline.js` con el `node.exe` de la primera versión que encuentre, en orden alfabético descendente del nombre de la carpeta
- AND si no hay proto, usa el `node` del PATH
- AND el código de salida es siempre 0

Se usa el `node.exe` real de proto y no su shim porque el shim inyecta a veces
una línea NDJSON en stdout que ensuciaría el statusline.

## Reglas de la capacidad

- **Dónde viven los datos**: en `<perfil>\hooks`. El instalador no escribe en ningún otro sitio.
- **Idioma de los nombres**: los mensajes de `install.ps1` están hoy en castellano. La regla 2 de `constitution.md` pide inglés para el texto que pinta el producto; pendiente de decidir si aplica al instalador.
- **Límites**: no aplica.
- **Avisos**: el instalador avisa de dónde ha copiado y de qué hay que pegar en `settings.json`.
- **Regla ante conflicto**: la copia del repo manda: sobrescribe lo que haya en `hooks`.

## Historial

- 2026-09-20 — init — ADDED todos los requisitos. Volcado inicial desde el código, a petición del usuario (excepción a la regla anti-proliferación 4).
