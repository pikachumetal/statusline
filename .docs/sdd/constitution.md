# Constitution — statusline

Principios no negociables. Una task que necesite romper uno lo dice de forma
explícita en su spec y se aprueba antes de implementar.

## Principios de trabajo

1. **Test primero.** Ningún cambio de comportamiento entra sin su test en
   `statusline.test.js`. `node statusline.test.js` pasa antes de cada commit.
   - **Quién escribe los tests:** los tests en RED los escribe el hilo
     principal. Un subagente recibe los tests ya en RED y su trabajo es
     ponerlos en GREEN. Un subagente nunca escribe los tests de su propia
     implementación ni modifica los que recibe para que pasen.
   - **El mod:** sus tests viven en `mod/tests/` y `claude plugin test mod`
     también pasa antes de cada commit.
2. **Sin dependencias npm.** `statusline.js` usa solo Node y `git` como binario
   externo. El mod tampoco tiene dependencias npm: lo compila y lo ejecuta
   Claude Code (2.1.302 o superior). El instalador usa el CLI `claude` si está en
   el PATH.
3. **El statusline nunca rompe.** Con stdin vacío o inválido pinta con valores
   por defecto. Un segmento que falla no impide pintar el resto.
4. **Nunca pinta secretos.** Ningún segmento muestra tokens, claves de API ni
   el contenido de variables de entorno sensibles. El mod lee el texto de los
   comandos de Bash para saber si son tests, pero nunca lo pinta, y sus avisos
   enseñan como mucho la primera línea de la respuesta de un comando de selector,
   recortada a 80 caracteres.

## Reglas de producto

### 1. Dónde viven los datos — respondida

El statusline no guarda estado propio y no escribe ficheros. En cada ejecución
todo sale de cuatro fuentes:

- El JSON que Claude Code manda por stdin.
- `git`.
- Las variables de entorno.
- Los ficheros flag de otros plugins dentro de `CLAUDE_CONFIG_DIR`, solo en
  lectura y con hardening: sin symlinks, máximo 64 bytes y whitelist.

Hoy no se permite caché. Si un segmento futuro la necesita, esa task abre esta
regla de forma explícita.

Excepción (patch 0009): el wrapper opcional `statusline-orca.cmd` guarda el
stdin en un temporal de `%TEMP%` para pasárselo a `statusline.cmd` y a Orca, y
lo borra al acabar. Si Claude Code mata el proceso antes, el temporal queda
huérfano. `statusline.js` sigue sin escribir ficheros.

Excepción (feature 0024): el mod de controles tampoco escribe ficheros, pero sus
fuentes son otras: Claude Code (`$.session` y los eventos de la sesión) y los
mismos ficheros flag, con whitelist y 64 bytes como máximo, sin comprobar
symlinks (el motor no lo permite; la whitelist limita lo que se puede colar).
Lo que recuerda vive en el estado de sesión de Claude Code, en memoria. Los
valores por defecto que guardan `/model` y `/effort` los escribe Claude Code.

### 2. Idioma de los nombres — respondida

- **En inglés:** código, variables de entorno propias, claves de configuración
  y el texto que pinta el statusline.
- **En castellano:** `.docs/sdd/`, comentarios del código y commits.
- **Nombres de fichero de `.docs/sdd/`:** en inglés kebab-case, incluidas las
  capacidades (`capabilities/<capability>.md`). Solo el contenido va en castellano.
- **README:** bilingüe, en dos ficheros: `README.md` en castellano y
  `README.en.md` en inglés, con el enlace al otro idioma en la primera línea.
  Los dos dicen lo mismo, sección por sección.

### 3. Límites — respondida

- Sin dependencias npm.
- Todas las llamadas a `git` de un refresco comparten un presupuesto de tiempo,
  y el statusline completo tiene un tope comprobado con un test. Las cifras viven
  en `capabilities/input.md` («Consulta a git»).
- Todo fichero externo que se lea tiene un tope de 64 bytes.
- Número de líneas: 2 por defecto. No es un tope fijo: pasa a ser configurable
  cuando llegue el módulo de configurabilidad (ver `roadmap.md`).

### 4. Avisos — respondida

Vigentes:

- Umbrales visuales del contexto y de las ventanas de 5h y semanal: 🟢 por
  debajo del 20 %, 🟡 por debajo del 70 %, 🔥 por debajo del 90 % y 🚨 a partir
  de ahí.
- Gradiente en las barras de la ventana de 5h y la semanal.
- El porcentaje del contexto, de la ventana de 5h y de la semanal cambia de
  color con los mismos cortes (20 %, 70 %, 90 %).
- Si a un segmento le falta un dato (no hay `git`, el JSON no lo trae), se omite
  o usa su valor por defecto, sin avisar.
- Si un segmento falla al pintarse (lanza un error), se pinta un `⚠` discreto en
  su sitio y el resto de segmentos se pinta igual.
- No hay texto de aviso ni nada que interrumpa.
- Excepción (feature 0024): el mod de controles da un aviso solo como respuesta
  a un clic de la persona.

### 5. Regla ante conflicto — respondida

El stdin de Claude Code manda. Si un dato viene en el JSON, se usa ese. `git`,
las variables de entorno y los ficheros solo rellenan lo que el JSON no trae.

Excepción: para el nombre del worktree manda `git`. El JSON trae el id interno
de git (`.git/worktrees/<id>`), que es ilegible cuando el worktree se movió tras
crearse. Se pinta el nombre de la carpeta del worktree.

## Git

- **`main`:** solo lo publicado. Cada publicación lleva su tag.
- **`develop`:** rama de desarrollo.
- **Ramas de trabajo (git-flow):** `feature/<x>`, `release/<x>`, `hotfix/<x>`
  y `chore/<x>`.
  - `feature/*` y `chore/*` salen de `develop` y vuelven a `develop`.
  - `release/*` sale de `develop` y se integra en `main` (con tag) y en `develop`.
  - `hotfix/*` sale de `main` y se integra en `main` (con tag) y en `develop`.
- **Patches:** la rama de cada patch se decide al abrirlo, según sea una tarea
  pequeña o un hotfix. No hay asignación por defecto.
- **Integración:** merge local con `--no-ff`, sin PR, mientras haya un único
  desarrollador. Si entra más gente, esta regla se revisa.
- **Worktrees:** permitidos, pero los abre el usuario a mano cuando hay tareas
  en paralelo. Ninguna skill abre un worktree por su cuenta.
- **Commits:** mandan las convenciones del `CLAUDE.md` global del usuario
  (tipo y scope en inglés; título y cuerpo en castellano).

## Proceso

- **Changelog:** solo técnico, en `.docs/sdd/changelog.md`. No hay changelog
  para cliente.
- **Numeración:** propia, porque no hay gestor de tickets. Una sola secuencia de
  cuatro dígitos (`0001`, `0002`…) compartida por tasks y patches. El id se asigna
  en `roadmap.md` cuando el item entra en una release, y es el `<id>` de su carpeta
  en `specs/` y de su rama (`feature/0001-<slug>`). Un id no se reutiliza. Los tres
  registros anteriores a esta regla conservan `0000`.
- **Tickets:** no hay gestor. La fuente de tasks es `roadmap.md`. Un issue de
  GitHub se triagea y acaba como entrada del roadmap con su referencia (`#N`).
- **Datos y migraciones:** no aplican. El statusline no guarda estado propio.
