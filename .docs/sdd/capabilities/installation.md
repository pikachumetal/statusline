# Capacidad — installation

## Propósito

Cómo llega el statusline a un perfil de Claude Code y cómo se lanza. Solo Windows tiene instalador y lanzador.

## Requisitos

### Copia de ficheros al perfil

- GIVEN el repo clonado en una máquina Windows con PowerShell 7+
- WHEN se ejecuta `.\install.ps1`, con o sin `-ConfigDir <perfil>`
- THEN `statusline.js`, `statusline.cmd`, `statusline-orca.cmd` y `statusline.test.js` se copian a `<perfil>\hooks`
- AND el perfil por defecto es `~/.claude`
- AND la carpeta `hooks` se crea si no existe, y los ficheros que ya hubiera se sobrescriben
- AND si un fichero no se puede copiar (p. ej. `statusline.cmd` bloqueado por la sesión que lo usa), el instalador se para en él con un error que lo nombra y código de salida distinto de 0, sin decir que ha copiado los ficheros ni mostrar el bloque `statusLine`; los copiados antes se quedan

### El instalador no toca settings.json

- GIVEN una instalación en un perfil
- WHEN `install.ps1` termina
- THEN muestra por pantalla el bloque `statusLine` que hay que pegar en `<perfil>\settings.json`, con la ruta del `.cmd` ya escapada, `padding: 0` y `refreshInterval: 10`
- AND el `.cmd` es `statusline-orca.cmd` si existe el hook de Orca (`-OrcaHook`, por defecto `~\.orca\agent-hooks\claude-statusline.cmd`), y `statusline.cmd` si no
- AND `install.ps1` no crea ni modifica `settings.json` por su cuenta
- AND el CLI `claude` que invoca para el mod sí registra el plugin y su marketplace en la configuración del perfil, `settings.json` incluido

### Update sobre una instalación existente

- GIVEN un perfil donde el statusline ya está instalado y `settings.json` tiene un `statusLine.command` que apunta al `statusline.cmd` de ese perfil
- WHEN se ejecuta otra vez `.\install.ps1` sobre ese perfil
- THEN los ficheros de `hooks` se sobrescriben con los del repo
- AND el instalador informa de que el perfil está actualizado y no muestra el bloque para pegar
- AND `install.ps1` lee `settings.json` pero no lo modifica por su cuenta
- AND ejecuta igual los dos comandos `claude plugin` de «Instalación del mod de controles»; con un perfil que ya tiene el mod, los dos salen con 0 y el instalador avisa de que el mod está instalado
- AND si `settings.json` no existe, no se puede leer o apunta a otro comando, se muestra el bloque como en una instalación limpia

### Lanzador

- GIVEN `statusline.cmd` y `statusline.js` en la misma carpeta
- WHEN Claude Code ejecuta `statusline.cmd`
- THEN si existe `%USERPROFILE%\.proto\tools\node`, lanza `statusline.js` con el `node.exe` de la versión más alta por SemVer (`26.10.0` antes que `26.9.0`, y `26.x` antes que `9.x`); una carpeta sin `node.exe` se ignora y un nombre que no es versión cuenta como `0.0.0`
- AND usa el `node.exe` real de proto y no su shim, que a veces inyecta una línea NDJSON en stdout que ensuciaría el statusline
- AND si no hay proto, usa el `node` del PATH
- AND el código de salida es siempre 0

### Wrapper de Orca

> Cobertura: con test (solo en Windows).

- GIVEN `statusline-orca.cmd` y `statusline.cmd` en la misma carpeta
- WHEN Claude Code ejecuta `statusline-orca.cmd` con el JSON de la sesión por stdin
- THEN guarda el stdin en un temporal de `%TEMP%` y se lo pasa a `statusline.cmd`, que pinta
- AND si existe `%USERPROFILE%\.orca\agent-hooks\claude-statusline.cmd`, le pasa el mismo JSON y descarta su salida
- AND borra el temporal y sale con 0

### Instalación del mod de controles

- GIVEN el repo clonado y el CLI `claude` en el PATH
- WHEN se ejecuta `.\install.ps1`, con o sin `-ConfigDir <perfil>`, después de copiar la status line
- THEN ejecuta, con `CLAUDE_CONFIG_DIR` apuntando al perfil, `claude plugin marketplace add <raíz del repo>` y `claude plugin install statusline-controls@statusline`
- AND avisa de que el mod está instalado en el perfil
- AND el mod se lee de la carpeta `mod/` del clon: un `git pull` y `/reload-plugins` lo actualizan sin reinstalar

### Sin CLI de Claude Code

- GIVEN un equipo sin `claude` en el PATH (o `-Claude` apuntando a un fichero que no existe)
- WHEN se ejecuta `.\install.ps1`
- THEN la status line se instala como siempre
- AND el instalador avisa de que no ha instalado el mod y de cómo hacerlo a mano
- AND el código de salida es 0

### Fallo al instalar el mod

- GIVEN un `claude` que sale con 1 al ejecutar `plugin marketplace add` o `plugin install`
- WHEN se ejecuta `.\install.ps1`
- THEN la status line queda instalada y su bloque `statusLine`, o el aviso de perfil actualizado, se muestra como siempre
- AND el instalador termina con un error que nombra el comando que falló y código de salida distinto de 0

### El instalador no toca statusline.json

- GIVEN un perfil con un `statusline.json`
- WHEN se ejecuta `install.ps1` sobre ese perfil, como instalación limpia o como update
- THEN el `statusline.json` queda igual byte a byte
- AND sin `statusline.json`, el instalador no lo crea

## Reglas de la capacidad

- **Dónde viven los datos**: la status line, en `<perfil>\hooks`. El mod no se copia: Claude Code lo lee de `mod/` del clon, así que mover o borrar el clon lo deja sin cargar hasta reinstalar, y cambiar de rama en el clon cambia el mod de todos los perfiles. El registro del mod lo escribe el CLI `claude` en la configuración de plugins del perfil. El instalador no escribe en ningún otro sitio.
- **Idioma de los nombres**: los mensajes de `install.ps1` están hoy en castellano. La regla 2 de `constitution.md` pide inglés para el texto que pinta el producto; pendiente de decidir si aplica al instalador.
- **Límites**: no aplica.
- **Avisos**: el instalador avisa de dónde ha copiado, de qué hay que pegar en `settings.json` y de si ha instalado el mod o por qué no.
- **Regla ante conflicto**: la copia del repo manda: sobrescribe lo que haya en `hooks`. Para el mod, manda el clon.
