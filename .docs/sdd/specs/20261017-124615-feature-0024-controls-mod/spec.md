---
id: 20261017-124615-feature-0024-controls-mod
feature: 0024
title: Mod de controles bajo la status line
mode: full
profile: delegate
status: approved
created: 2026-10-17
author: Claude (Opus 5.5)
approvers:
  - role: dev-lead
    name: Àngel Delgado
    approved_at: 2026-10-17
---

# Spec — Mod de controles bajo la status line

> **Estado**: approved.
> **Siguiente paso**: `plan.md` con `superpowers:writing-plans`, tras aprobar esta spec.

## Capacidades

- Nuevas: `controls` — la fila clicable que pinta el mod bajo la status line: selectores de modelo, effort, caveman y ponytail, coste, estado de los tests y Board.
- Modificadas: `installation` — `install.ps1` instala también el mod en el perfil, y el CLI `claude` que invoca registra el plugin en la configuración del perfil, también en un update.

## Decisiones que he tomado yo — valida estas

```text
Review de spec propuesta: dos revisores — señales: capacidad nueva (`controls`), contrato público (el formato de `.claude-plugin/marketplace.json` y del plugin lo consume Claude Code), MODIFIED (dos requisitos de `installation`), dependencia externa (el motor de mods y el CLI `claude`) · tamaño: ~400 líneas en 13 ficheros
- Dominio: si el MODIFIED de «El instalador no toca settings.json» deja claro qué escribe `claude plugin` en el perfil, y si los THEN de `controls` con el effort elegido aguantan un `/effort` que Claude Code rechaza (señal: MODIFIED + capacidad nueva)
- Técnica: si el `source: ./mod` del marketplace de carpeta y la instalación por perfil con `CLAUDE_CONFIG_DIR` son coherentes con «Update sobre una instalación existente», y si el mod respeta la regla 1 de la constitution (no escribir ficheros) (señal: contrato público + dependencia externa)
- Mínimo razonable: un revisor con los siete puntos — mira lo mismo con una sola lectura; deja sin cubrir la comprobación cruzada de `architecture.md` contra el marketplace de carpeta, que solo lee la lente técnica
```

1. Capacidad nueva `controls` para la fila del mod. — Es una superficie distinta de `output`, `session-state` y `usage`, que describen lo que pinta `statusline.js`.
2. El plugin se llama `statusline-controls` y el marketplace de carpeta, `statusline`. — El nombre dice qué es y de qué repo sale; el instalador ejecuta `claude plugin install statusline-controls@statusline`.
3. El mod sustituye la línea de pista del motor (`ui.render` sobre `PromptHint`) por su propio árbol, y pinta detrás el texto de pista que le pasa el motor, en la forma plegada y en la abierta. — Es el único sitio debajo de la status line donde un mod puede pintar; el spike lo comprobó.
4. El coste y el `$/h` salen de `$.session.usage()` en cada pintado: `cost.usd` y las horas desde `startedAt`. El `$/h` sigue la regla de la status line: solo con 5 minutos o más de sesión y coste mayor que 0. — Leído en vivo no hereda el desfase de la banda de ponytail, que solo lo guarda al acabar cada turno. El `$/h` puede diferir unos céntimos del que pintaba la L2, que usa `total_duration_ms` del stdin.
5. El effort que pinta la fila es el que Claude Code confirma: el del último turno, o el que dice la respuesta de `/effort` si empieza por `Set effort level to <nivel>`. Con otra respuesta (p. ej. `Kept effort level as medium`, visto en el spike con `CLAUDE_EFFORT=medium` en el entorno) la fila sigue con el effort anterior y el aviso enseña la respuesta. — `$.session` no expone el effort; leer la respuesta es frágil si Claude Code cambia ese texto, pero el fallo es benigno: la fila se queda con el valor anterior hasta el siguiente turno.
6. Modelos del selector: `opus`, `sonnet` y `haiku`. — Son los alias de `/model` que el spike comprobó; otros modelos se cambian con `/model` a mano.
7. Caveman sin opción `off`. — Apagarlo es la frase «stop caveman», no un comando; sin un comando verificado no hay botón.
8. Elegir modelo o effort lo guarda también como valor por defecto de las sesiones nuevas. — Lo escribe Claude Code, no el mod: la respuesta de `/model` y `/effort` lo dice («saved as your default for new sessions»). Se documenta en el README.
9. El selector abierto tiene `✕` para cerrarlo sin elegir, y no se pliega solo al empezar un turno. Una opción elegida con un turno en curso se pliega al momento y su comando se ejecuta cuando la sesión queda libre. — No pediste `✕`; sin él, abrir uno por error obliga a elegir. La cola es lo que hace `$.command.run`.
10. La detección de comandos de test es una copia propia de la heurística de ponytail, no una dependencia de su plugin. — Lo pediste como «forkear las cosas que nos interesan»; el mod no puede importar código de otro plugin.
11. Board abre `<XDG_CONFIG_HOME>/ponytail/band/board.html`, o `<home>/.config/ponytail/band/board.html` sin esa variable (`home` es `HOME`, o `USERPROFILE` en Windows), con `cmd /c start` en Windows y `open`/`xdg-open` fuera de Windows. — Es la misma ruta que regenera ponytail; el mod no regenera el board.
12. `install.ps1` no escribe `settings.json`, pero el CLI `claude plugin` al que llama registra el plugin en la configuración del perfil (`enabledPlugins` y el marketplace conocido), en la instalación y en cada update. Se declara como MODIFIED de dos requisitos de `installation`. El título «El instalador no toca settings.json» se mantiene porque es la clave de fusión; el texto dice lo que el instalador hace por su cuenta. — Instalar un plugin sin que el perfil lo registre no es posible.
13. Si `claude plugin marketplace add` o `claude plugin install` fallan, el instalador termina con error y código distinto de 0, con la status line ya instalada y su bloque mostrado; sin `claude` en el PATH, avisa y termina con 0. — Un fallo no se da por bueno; la ausencia del CLI es un caso previsto.
14. `install.ps1` gana el parámetro `-Claude <ruta>` para que los tests usen un CLI falso. Que el `claude` real no falle al repetir la instalación sobre un perfil que ya tiene el mod se comprueba en la validación, no en la suite. — Es el mismo patrón que `-OrcaHook`; la suite no puede tocar los perfiles reales.
15. `statusline.js` no cambia en esta feature. Tu layout (L1 `duration, profile, where, velocity`; L2 `context, five_hour, seven_day`) llega con `statusline.json` en la 0023. Hasta que salga, el coste y los modos se ven dos veces, en la status line y en la fila. — Cambiar el default rompería a quien use la status line sin el mod, o en un host sin mods. La 0024 se puede integrar antes que la 0023.
16. Estado del mod en `$.state` de la sesión (selector abierto, effort confirmado, último resultado de tests), que se pierde al cerrarla. — Es estado en memoria de Claude Code, no ficheros: el mod sigue sin escribir nada.
17. Los tests del mod son `*.test.ts` en `mod/tests/` y se ejecutan con `claude plugin test mod`. El gate antes de cada commit pasa a ser `node statusline.test.js` y `claude plugin test mod`. Requiere Claude Code con mods; probado con la versión 2.1.302, que se declara como mínima. El TypeScript lo compila Claude Code: no hay `tsc` ni `package.json`. — La suite de Node no puede cargar un mod.
18. Enmiendas de la constitution, acotadas al mod y sin cambiar nada de `statusline.js`:
    - **Principio 1**: el gate incluye `claude plugin test mod`.
    - **Principio 2**: `statusline.js` sigue con solo Node y `git`. El mod depende de Claude Code, y el instalador usa el CLI `claude` si está.
    - **Principio 4**: el mod lee el texto de los comandos de Bash para saber si son tests, pero nunca lo pinta. Los avisos solo enseñan la primera línea de la respuesta de los cuatro comandos de los selectores, recortada a 80 caracteres.
    - **Regla 1**: se queda para `statusline.js`. Se añade la del mod: Claude Code (`$.session`, eventos), los flags y estado de sesión en memoria. Sin ficheros, sin caché.
    - **Regla 4**: se queda para `statusline.js`. El mod puede dar un aviso solo como respuesta a un clic.
    - **Forma del proyecto**: «un fichero» pasa a «`statusline.js` y el mod en `mod/`».
    - **Hardening de flags en el mod**: whitelist y 64 bytes, sin comprobar symlinks (`$.fs` no expone `lstat`). Una whitelist ya limita lo que un symlink puede colar.
19. Los avisos y el texto del mod, en inglés. — Es la regla 2 de la constitution para el texto que pinta el producto.
20. Si el clon se mueve o se borra, Claude Code deja de cargar el mod, y cambiar de rama en el clon cambia el mod de todos los perfiles. Se documenta en el README y en las reglas de `installation`; reinstalar desde la nueva ruta lo arregla. — Es el precio de leer el mod del clon, que elegiste.

### Hallazgos de la review

- Aceptado → MODIFIED de «Update sobre una instalación existente», con escenario de perfil ya instalado (dominio 1, técnica 1).
- Aceptado → enmiendas de la regla 1, la regla 4 y los principios 2 y 4, acotadas al mod (dominio 2 y 4, técnica 3); decisión 18.
- Aceptado → avisos en inglés (dominio 3, técnica 10); decisión 19.
- Aceptado → `⚠` en el sitio del coste si falla (dominio 5).
- Aceptado → escenario de effort rechazado, y regla ante conflicto con el effort que confirma Claude Code (dominio 6, técnica 5); decisión 5.
- Aceptado → `CLAUDE.md` del proyecto en el Scope; `capabilities/controls.md` se crea al cerrar con la fusión del delta (dominio 7, técnica 7).
- Aceptado → el Intent deja claro que aligerar la status line depende de la 0023, y la duplicación es transitoria (dominio 8, técnica 4); decisión 15.
- Aceptado → turno en curso, turno nuevo con el selector abierto y pista del motor en la forma abierta (dominio 9); decisión 9.
- Aceptado → fallo de `marketplace add`, bloque mostrado en el fallo e idempotencia del CLI real en la validación (técnica 2, dominio 10); decisiones 13 y 14.
- Aceptado → los THEN del motor y del coste se reformulan sobre lo que pinta la fila, sin cifras del spike (técnica 6).
- Aceptado → `$.state`, `PromptHint`, gate de tests y versión mínima en la lista de decisiones (técnica 7); decisiones 3, 16 y 17.
- Aceptado → riesgo del clon movido, documentado y fuera de alcance como escenario (técnica 8); decisión 20.
- Aceptado → escenario con `XDG_CONFIG_HOME`, y definición de comando de test en una línea compuesta y de dónde sale el resultado (técnica 9).
- Aceptado → comando de un plugin ausente (técnica 5).
- Rechazado → renombrar «El instalador no toca settings.json» (dominio 10): el título es la clave de fusión de la capacidad; el texto ya dice lo que hace el instalador por su cuenta (decisión 12).
- Rechazado → test de symlink en los flags del mod (técnica 10): el mod no comprueba symlinks (decisión 18).

### Decisiones tomadas con el dev-lead

- El mod vive en este repo, carpeta `mod/`. — «Este repo, carpeta mod/»
- Una sola feature, sin partir. — «Entera, unattended»
- Perfil `delegate` para esta feature. — «pero delegated»
- `install.ps1` instala el mod desde el clon local. — «Del clon local»
- Indicador de tests solo con `[passed]` y `[failed]`. — «Solo passed/failed»
- El coste baja al mod con el `$/h`; la L2 se queda con contexto y barras. — «yo te diria que el tema coste que baja al mod, abria de pooenrle el de precio por hora […] L2 dejaria solo contextos y barras de uso»
- Al abrir un selector, el resto de la fila se oculta y vuelve al elegir. — «cuando haces click para selecionar pode irse lo demas y volver al seleccionar ? […] ponytail lo hace asi»
- El effort va en gris, como en la status line. — «el effort puede estar en un color mas gris como antes?»
- En la L1, el reloj va primero (se aplica con `statusline.json`, 0023). — «en la Linea uno el reloj lo primero»
- Review de la spec con dos revisores, dominio con Opus y técnica con Sonnet. — «dom opus, tec sonnet»
- Spec aprobada el 2026-10-17. — «ok»

## Intent

Hoy el modelo, el effort, caveman y ponytail solo se ven en la L1, y cambiarlos exige escribir un comando. La banda de ponytail permite cambiar su nivel con un clic, pero ocupa sitio encima del prompt y su coste se queda atrás entre turnos. Se quiere una fila clicable bajo la status line que cambie esos cuatro valores con dos clics y enseñe el coste en vivo, el estado de los tests y el Board, para poder ocultar la banda de ponytail. Aligerar la status line quitando de ella lo que la fila ya enseña se hace con `statusline.json`, cuando salga la 0023.

## Scope

- Entra:
  - `mod/`: `.claude-plugin/plugin.json`, `hooks/hooks.json`, el módulo de hooks, sus tipos y sus tests.
  - `.claude-plugin/marketplace.json` en la raíz del repo, con `source: ./mod`.
  - `install.ps1`: instalar el mod en el perfil, en instalación y update, y el parámetro `-Claude`.
  - `statusline.test.js`: los tests del instalador para el mod.
  - Enmiendas de `constitution.md` de la decisión 18; `tech-stack.md`, `architecture.md` y `mission.md` con el mod.
  - `CLAUDE.md` del proyecto: la forma del proyecto, el gate de tests y las reglas críticas que cambian con la decisión 18.
  - `README.md` y `README.en.md`: sección del mod, con el valor por defecto que guardan `/model` y `/effort` y el riesgo del clon movido.
  - La fila de la 0024 en el roadmap.
  - `capabilities/controls.md`, que crea el cierre al fusionar el delta.
- No entra:
  - Cambiar `statusline.js` o su layout por defecto (lo cubre la 0023).
  - Apagar caveman desde la fila.
  - Otros modelos en el selector.
  - Instalar el mod en macOS o Linux con `install.ps1`.
  - Ocultar o mover la pista del motor.
  - Publicar el mod en un marketplace de GitHub.
  - Recuento de tests o aviso de tests obsoletos.
  - Detectar un clon movido o borrado.

## Approach

El mod sustituye la línea de pista del motor bajo la status line por su propio árbol, con dos formas: plegada, con todos los controles, y abierta, con las opciones de un selector. En las dos pinta detrás la pista del motor. Cada opción ejecuta el mismo comando que escribiría la persona (`$.command.run`), así que la lógica de cada modo sigue en su plugin. El estado del mod vive en el estado de sesión de Claude Code, nunca en ficheros. La lógica que no depende del motor (nombre del modelo, `$/h`, detección de tests, lectura de la respuesta de `/effort`) va aparte del pintado para probarla sin él.

El repo pasa a ser un marketplace de carpeta, y `install.ps1` registra el mod en cada perfil con el CLI `claude` y su `CLAUDE_CONFIG_DIR`. Claude Code lee el mod del clon: `git pull` y `/reload-plugins` lo actualizan.

## Delta de comportamiento

### Capacidad: `controls`

**ADDED — Fila plegada**
- GIVEN el mod instalado, la sesión en `claude-opus-5-5` con effort `medium` en el último turno, `.caveman-active` = `caveman`, `.ponytail-active` = `full`, 30 minutos de sesión y un coste de 7.50 USD
- WHEN Claude Code pinta la línea bajo la status line
- THEN la fila muestra, en este orden, `🤖 Opus 5.5`, `(medium)` en gris, `🗿 caveman`, `🦥 full`, `💰 $7.50 · $15.00/h` y `Board`, y detrás el texto de pista que le pasa el motor
- AND el modelo, el effort, caveman, ponytail y Board se pueden pulsar

**ADDED — Nombre del modelo**
- GIVEN la sesión en `claude-sonnet-5-5`, o en `claude-haiku-4-5-20251001`
- WHEN se pinta la fila plegada
- THEN el modelo sale como `🤖 Sonnet 5.5`, o como `🤖 Haiku 4.5`
- AND un id que no sigue la forma `claude-<familia>-<mayor>-<menor>` sale tal cual

**ADDED — Coste en vivo**
- GIVEN una sesión con 4 minutos y 0.40 USD
- WHEN se pinta la fila
- THEN el coste sale `💰 $0.40`, sin `$/h`
- AND con 0 USD tras 30 minutos sale `💰 $0.00`, sin `$/h`
- AND el coste es el `cost.usd` que da Claude Code en ese pintado: si sube de 7.50 a 7.55 USD entre dos turnos, sin que termine ningún turno, el siguiente pintado muestra `💰 $7.55`

**ADDED — Abrir un selector**
- GIVEN la fila plegada con effort `medium`
- WHEN se pulsa `(medium)`
- THEN la fila solo muestra `effort`, las opciones `low`, `medium`, `high`, `xhigh` y `max` con `medium` resaltada, y `✕`, y detrás el texto de pista que le pasa el motor
- AND el resto de controles del mod no se pinta mientras el selector está abierto
- AND el selector sigue abierto aunque empiece un turno
- AND las opciones de cada selector son: modelo `opus`, `sonnet`, `haiku`; effort `low`, `medium`, `high`, `xhigh`, `max`; caveman `caveman`, `ultracave`, `megacave`; ponytail `off`, `lite`, `full`, `ultra`

**ADDED — Elegir una opción**
- GIVEN el selector de effort abierto con `medium` resaltada
- WHEN se pulsa `high` y `/effort high` responde `Set effort level to high (saved as your default for new sessions): …`
- THEN la fila vuelve a la forma plegada y muestra `(high)`
- AND un aviso enseña la primera línea de la respuesta, recortada a 80 caracteres
- AND con el selector de modelo, pulsar `sonnet` ejecuta `/model sonnet` y la fila plegada muestra `🤖 Sonnet 5.5`
- AND con caveman, `ultracave` ejecuta `/caveman:caveman ultracave`; con ponytail, `lite` ejecuta `/ponytail:ponytail lite`
- AND si se elige con un turno en curso, la fila se pliega al momento y el comando se ejecuta cuando la sesión queda libre

**ADDED — Cambio que Claude Code no aplica**
- GIVEN el selector de effort abierto, con `medium` como effort confirmado
- WHEN se pulsa `low` y `/effort low` responde `Kept effort level as medium`
- THEN la fila vuelve a la forma plegada con `(medium)`
- AND el aviso enseña `Kept effort level as medium`

**ADDED — Comando que no existe**
- GIVEN el plugin ponytail desinstalado
- WHEN se elige `full` en el selector de ponytail
- THEN la fila vuelve a la forma plegada sin cambiar `🦥`
- AND un aviso dice que `/ponytail:ponytail` no está disponible

**ADDED — Cerrar sin elegir**
- GIVEN el selector de effort abierto
- WHEN se pulsa `✕`
- THEN no se ejecuta ningún comando y la fila vuelve a la forma plegada con `(medium)`

**ADDED — Modos de otros plugins**
- GIVEN `.caveman-active` ausente y `.ponytail-active` con `lite`
- WHEN se pinta la fila plegada
- THEN muestra `🗿 off` y `🦥 lite`
- AND un flag con un valor fuera de su whitelist o de más de 64 bytes cuenta como `off`

**ADDED — Estado de los tests**
- GIVEN una sesión en la que todavía no se ha lanzado ningún test
- WHEN se pinta la fila
- THEN no aparece indicador de tests
- AND tras un `node statusline.test.js` por Bash que sale con 0, aparece `[passed]` en verde antes de `Board`
- AND tras un `npm test` que sale con 1, cambia a `[failed]` en rojo
- AND un comando compuesto cuenta si alguno de sus tramos separados por `&&`, `||`, `;` o `|` es un test: `git add . && node statusline.test.js` cuenta
- AND un `git status` posterior no lo cambia, ni un test lanzado en segundo plano, cuyo resultado no llega con la llamada

**ADDED — Board**
- GIVEN `XDG_CONFIG_HOME` sin definir y `<home>/.config/ponytail/band/board.html` existe
- WHEN se pulsa `Board`
- THEN se abre ese fichero en el navegador por defecto
- AND con `XDG_CONFIG_HOME=D:\cfg` se abre `D:\cfg\ponytail\band\board.html`
- AND si el fichero no existe, no se abre nada y un aviso dice que ponytail aún no ha generado el board

**ADDED — Un fallo no rompe la línea**
- GIVEN `$.session.usage()` falla en un pintado
- WHEN se pinta la fila
- THEN en el sitio del coste sale un `⚠` gris y el resto de controles se pinta igual
- AND si falla el pintado de la fila entera, la línea muestra la pista normal del motor, sin controles del mod

**Reglas de la capacidad**
- **Dónde viven los datos**: el mod no escribe ficheros. Lee el modelo y el coste de Claude Code (`$.session`), el effort de cada turno y de la respuesta de `/effort`, el resultado de las llamadas a Bash de la sesión, y los modos de `.caveman-active` y `.ponytail-active` en `CLAUDE_CONFIG_DIR`. Lo que recuerda (selector abierto, effort confirmado, último resultado de tests) vive en el estado de sesión de Claude Code y se pierde al cerrarla. Los valores por defecto que guardan `/model` y `/effort` los escribe Claude Code.
- **Idioma de los nombres**: en inglés, el texto de la fila y los avisos (`effort`, `Board`, `[passed]`, `[failed]`, `command not available`).
- **Límites**: los flags se leen con un máximo de 64 bytes y con whitelist. El `$/h` se pinta a partir de 5 minutos de sesión y con coste mayor que 0. Un aviso enseña como mucho la primera línea de una respuesta, recortada a 80 caracteres. El texto de los comandos de Bash nunca se pinta.
- **Avisos**: solo como respuesta a un clic: la respuesta de cada comando que lanza un selector, el comando que no existe y el Board que falta. Un dato que falla deja un `⚠` gris en su sitio.
- **Regla ante conflicto**: manda Claude Code. El modelo que pinta la fila es el de `$.session.model()`, y el effort, el que Claude Code confirma en la respuesta de `/effort` o en el siguiente turno.

### Capacidad: `installation`

**ADDED — Instalación del mod de controles**
- GIVEN el repo clonado y el CLI `claude` en el PATH
- WHEN se ejecuta `.\install.ps1`, con o sin `-ConfigDir <perfil>`, después de copiar la status line
- THEN ejecuta, con `CLAUDE_CONFIG_DIR` apuntando al perfil, `claude plugin marketplace add <raíz del repo>` y `claude plugin install statusline-controls@statusline`
- AND avisa de que el mod está instalado en el perfil
- AND el mod se lee de la carpeta `mod/` del clon: un `git pull` y `/reload-plugins` lo actualizan sin reinstalar

**ADDED — Sin CLI de Claude Code**
- GIVEN un equipo sin `claude` en el PATH (o `-Claude` apuntando a un fichero que no existe)
- WHEN se ejecuta `.\install.ps1`
- THEN la status line se instala como siempre
- AND el instalador avisa de que no ha instalado el mod y de cómo hacerlo a mano
- AND el código de salida es 0

**ADDED — Fallo al instalar el mod**
- GIVEN un `claude` que sale con 1 al ejecutar `plugin marketplace add` o `plugin install`
- WHEN se ejecuta `.\install.ps1`
- THEN la status line queda instalada y su bloque `statusLine`, o el aviso de perfil actualizado, se muestra como siempre
- AND el instalador termina con un error que nombra el comando que falló y código de salida distinto de 0

**MODIFIED — El instalador no toca settings.json** (antes: «AND no crea ni modifica `settings.json`»)
- GIVEN una instalación en un perfil
- WHEN `install.ps1` termina
- THEN muestra por pantalla el bloque `statusLine` que hay que pegar en `<perfil>\settings.json`, con la ruta del `.cmd` ya escapada, `padding: 0` y `refreshInterval: 10`
- AND el `.cmd` es `statusline-orca.cmd` si existe el hook de Orca (`-OrcaHook`, por defecto `~\.orca\agent-hooks\claude-statusline.cmd`), y `statusline.cmd` si no
- AND `install.ps1` no crea ni modifica `settings.json` por su cuenta
- AND el CLI `claude` que invoca para el mod sí registra el plugin y su marketplace en la configuración del perfil, `settings.json` incluido

**MODIFIED — Update sobre una instalación existente** (antes: «AND `settings.json` se lee pero no se modifica»)

> Cobertura: con test (solo en Windows).

- GIVEN un perfil donde el statusline ya está instalado y `settings.json` tiene un `statusLine.command` que apunta al `statusline.cmd` de ese perfil
- WHEN se ejecuta otra vez `.\install.ps1` sobre ese perfil
- THEN los ficheros de `hooks` se sobrescriben con los del repo
- AND el instalador informa de que el perfil está actualizado y no muestra el bloque para pegar
- AND `install.ps1` lee `settings.json` pero no lo modifica por su cuenta
- AND ejecuta igual los dos comandos `claude plugin` de «Instalación del mod de controles»; con un perfil que ya tiene el mod, los dos salen con 0 y el instalador avisa de que el mod está instalado
- AND si `settings.json` no existe, no se puede leer o apunta a otro comando, se muestra el bloque como en una instalación limpia

**Reglas de la capacidad**
- **Dónde viven los datos**: la status line, en `<perfil>\hooks`. El mod no se copia: Claude Code lo lee de `mod/` del clon, así que mover o borrar el clon lo deja sin cargar hasta reinstalar, y cambiar de rama en el clon cambia el mod de todos los perfiles. El registro del mod lo escribe el CLI `claude` en la configuración de plugins del perfil. El instalador no escribe en ningún otro sitio.
- **Idioma de los nombres**: los mensajes de `install.ps1` están hoy en castellano. La regla 2 de `constitution.md` pide inglés para el texto que pinta el producto; pendiente de decidir si aplica al instalador.
- **Límites**: no aplica.
- **Avisos**: el instalador avisa de dónde ha copiado, de qué hay que pegar en `settings.json` y de si ha instalado el mod o por qué no.
- **Regla ante conflicto**: la copia del repo manda: sobrescribe lo que haya en `hooks`. Para el mod, manda el clon.

## Enmiendas

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
| --- | --- | --- | --- |
| dev-lead | Àngel Delgado | 2026-10-17 | aprobada: «ok» |
