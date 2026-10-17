# Architecture — statusline

## Forma

Dos piezas: `statusline.js`, la status line, y el mod de controles en `mod/`
(al final). `statusline.js`: Claude Code lo ejecuta en cada refresco: le
pasa el JSON de la sesión por stdin y pinta lo que el script escribe en stdout.
El proceso nace y muere en cada refresco. No hay estado entre ejecuciones.

## Flujo

1. `main()` lee el stdin y lo parsea. Si está vacío o es inválido, sigue con `{}`.
2. `readEnv(data)` reúne todo lo que no viene en el JSON:
   - `readGit`: repo, branch y worktree (de `rev-parse`) y estado del working tree y del upstream (de `git status --porcelain=v2 --branch`, que parsea `parseStatus`).
   - Perfil: el nombre del directorio de `CLAUDE_CONFIG_DIR`, salvo que sea el default.
   - Flags: `.caveman-active`, `.ponytail-active` y `.caveman-statusline-suffix`.
3. `render(data, env, now)` compone las líneas de `env.layout` (por defecto, las dos de la v1.2.0) y las escribe en stdout.

## Separación que hay que conservar

- **`render` es pura.** Recibe `data`, `env` y `now` como parámetros. No lee
  ficheros, no llama a `git` y no consulta el reloj. Por eso los tests la
  ejercitan sin mocks. Todo acceso al exterior vive en `readEnv` y en `main`.
- **Cada segmento se pinta dentro de `segment()`.** Si lanza, deja `⚠` en su
  sitio; si no tiene datos, devuelve `null` y se omite. Un segmento nuevo que
  no pase por `segment()` puede volver a tirar el statusline entero.
- **Un segmento, una entrada en `SEGMENTS` por su nombre** (`profile`, `where`, `model`, `caveman`, `ponytail`, `velocity`, `duration`, `context`, `five_hour`, `seven_day`, `cost`): devuelve el texto del segmento, o `null` si no hay nada que pintar; las que crecen salen a una función `render*`. El layout es una lista de líneas con esos nombres, y un nombre que no está pinta `⚠`. `render` no valida la forma del layout: quien lo construye lo valida antes (`readLayout`, al leer `statusline.json`).
- **Ficheros del perfil: los de otros plugins se ignoran si fallan, `statusline.json` avisa.** Los flags (64 bytes) los escriben otros plugins y un fallo es un dato ausente; `statusline.json` (4096 bytes) lo escribe la persona, y un fallo pinta el layout por defecto con `⚠` para que lo vea.
- **Todo acceso al JSON va con `?.` y valor por defecto.** Un campo ausente
  degrada su segmento, no rompe el render.
- **Un campo numérico del JSON se valida con `Number.isFinite` antes de operar
  con él.** Comprobarlo por truthy deja pasar un string o un objeto y el segmento
  acaba pintando `NaN`. Es el caso de `resets_at` en las dos ventanas de cuota.
- **Los tests que lanzan `statusline.js` fijan el entorno que lee:**
  `CLAUDE_CONFIG_DIR`, `CAVEMAN_STATUSLINE_SAVINGS`, `USERPROFILE`/`HOME` y
  `TEMP` apuntan a temporales o a valores fijos; heredarlos del usuario hace que
  la suite dependa de su máquina.
- **Exports:** solo lo que usan los tests: `render`, `bar`, `gitNames`,
  `readGit` (con su ejecutor de `git` inyectable), `parseStatus` y `gradientAt`, `GRAY_BG` y
  `RESET` para comprobar los colores.

## Decisiones técnicas

- **`project_dir` antes que `current_dir`.** `project_dir` es donde arrancó
  Claude Code. `current_dir` sigue al cwd de la shell y cambia durante la sesión.
- **Hardening al leer flags** (`readSmallFile`): sin symlinks, máximo 64 bytes
  y whitelist de valores. Es el mismo criterio que usa `caveman-badge.js`.
- **`git` nunca bloquea ni ensucia:** `--no-optional-locks`, stderr descartado
  y un plazo compartido por todas las llamadas de `readGit` (cifra en
  `capabilities/input.md`). Si falla, devuelve `null` y el segmento degrada; si
  se agota el plazo, lo marca con `timedOut` y la L1 pinta `⚠`. `readGit` recibe el ejecutor de `git` como parámetro para
  poder medir el plazo con un `git` lento simulado.
- **Gradiente por posición, no por valor.** El color de cada bloque de una barra
  depende de su posición en la barra (verde, amarillo, rojo). El color del
  porcentaje sí depende del valor (`levelColor`).
- **La celda de corte de una barra lleva fondo gris.** El sub-bloque de octavos
  solo ocupa parte de la celda; sin fondo propio, el resto mostraría el color de
  la terminal y partiría la barra.
- **El marcador de ritmo lleva el color de su celda en el fondo.** Sustituye el
  carácter de la celda por `┃`; el fondo conserva si esa celda estaba llena.

## Referencia externa

[ccstatusline](https://github.com/sirmalloc/ccstatusline) se puede consultar
para ver cómo resuelve un segmento. No se copia su arquitectura de widgets
configurables mientras la configurabilidad no entre en el roadmap.

## Mod de controles

Un mod de Claude Code en `mod/` que pinta una fila clicable bajo la status line
(`ui.render` sobre `PromptHint`). Comportamiento en `capabilities/controls.md`.

- **`mod/hooks/logic.ts` es puro**: nombre del modelo, texto del coste, lectura
  de flags y las opciones de cada selector. Se prueba sin simular el motor.
- **`mod/hooks/register.tsx` tiene todo el acceso al motor**: `$.session`,
  `$.fs`, `$.command.run` y el estado de sesión (`$.state`, atom `row`).
- **El render acaba en `.catch(($, e, next) => next(e))`**: si la fila falla,
  Claude Code pinta su línea de pista normal.
- **Cada control llama al comando que escribiría la persona** (`/model`,
  `/effort`, `/caveman:caveman`, `/ponytail:ponytail`): la lógica de cada modo
  sigue en su plugin.
- **El repo es un marketplace de carpeta** (`.claude-plugin/marketplace.json`):
  Claude Code lee el mod del clon, no de una copia.
- **El harness de tests del motor** (`claude-code/testing`) tiene sus reglas: un
  hook por evento en cada test; `turn.step` es un stream que hay que leer entero y
  su respuesta lleva `{ turnId, index, answer, toolUses }`; `tool.call` responde
  `{ result }`; un `Text` no conserva su `key` (se envuelve en un `Box`) y un
  `Button` exige `onPress`.
- **`$.env.get` exige un nombre literal** (el motor lista las variables que lee el
  mod) y **`$.command.run` rechaza un comando que no existe**.
- **El instalador no pasa `CLAUDE_CONFIG_DIR` para `~/.claude`**: con la variable,
  el CLI `claude` crea un `.claude.json` propio dentro de esa carpeta.
