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
2. **Sin dependencias npm.** Solo Node y `git` como binario externo.
3. **El statusline nunca rompe.** Con stdin vacío o inválido pinta con valores
   por defecto. Un segmento que falla no impide pintar el resto.
4. **Nunca pinta secretos.** Ningún segmento muestra tokens, claves de API ni
   el contenido de variables de entorno sensibles.

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

### 2. Idioma de los nombres — respondida

- **En inglés:** código, variables de entorno propias, claves de configuración
  y el texto que pinta el statusline.
- **En castellano:** `.docs/sdd/`, comentarios del código y commits.
- **README:** bilingüe (castellano e inglés). La forma concreta —un fichero con
  dos secciones o `README.md` más `README.en.md`— la decide la task que lo traduzca.

### 3. Límites — respondida en parte

Vigentes:

- Sin dependencias npm.
- Cada llamada a `git` lleva timeout (hoy `timeout: 2000` ms).
- Todo fichero externo que se lea tiene un tope de 64 bytes.
- Número de líneas: 2 por defecto. No es un tope fijo: pasa a ser configurable
  cuando llegue el módulo de configurabilidad (ver `roadmap.md`).

Pendiente:

- Presupuesto de tiempo total del render. Deseable, sin cifra. Se fija cuando
  exista un test que lo mida.

### 4. Avisos — respondida

Vigentes:

- Umbrales visuales del contexto: 🟢 por debajo del 20 %, 🟡 por debajo del
  70 %, 🔥 por debajo del 90 % y 🚨 a partir de ahí.
- Gradiente en las barras de la ventana de 5h y la semanal.
- El porcentaje del contexto, de la ventana de 5h y de la semanal cambia de
  color con los mismos cortes (20 %, 70 %, 90 %).
- Si un segmento falla (no hay `git`, falta un dato), se omite sin avisar.
- No hay texto de aviso ni nada que interrumpa.

Pendientes de implementar (ver `roadmap.md`). Hasta que su task se cierre, el
comportamiento vigente es el de arriba:

- Icono de alerta para las ventanas de 5h y semanal, como el que ya tiene el
  contexto. El color del porcentaje ya existe; falta solo el icono.
- Marcador discreto (`⚠`) cuando un segmento falla, en vez de omitirlo.

### 5. Regla ante conflicto — respondida

El stdin de Claude Code manda. Si un dato viene en el JSON, se usa ese. `git`,
las variables de entorno y los ficheros solo rellenan lo que el JSON no trae.

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
- **Tickets:** no hay gestor. La fuente de tasks es `roadmap.md`. Un issue de
  GitHub se triagea y acaba como entrada del roadmap con su referencia (`#N`).
- **Datos y migraciones:** no aplican. El statusline no guarda estado propio.
