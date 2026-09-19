# Architecture — statusline

## Forma

Un único fichero, `statusline.js`. Claude Code lo ejecuta en cada refresco: le
pasa el JSON de la sesión por stdin y pinta lo que el script escribe en stdout.
El proceso nace y muere en cada refresco. No hay estado entre ejecuciones.

## Flujo

1. `main()` lee el stdin y lo parsea. Si está vacío o es inválido, sigue con `{}`.
2. `readEnv(data)` reúne todo lo que no viene en el JSON:
   - `readGit`: repo, branch y worktree.
   - Perfil: el nombre del directorio de `CLAUDE_CONFIG_DIR`, salvo que sea el default.
   - Flags: `.caveman-active`, `.ponytail-active` y `.caveman-statusline-suffix`.
3. `render(data, env, now)` compone las dos líneas y las escribe en stdout.

## Separación que hay que conservar

- **`render` es pura.** Recibe `data`, `env` y `now` como parámetros. No lee
  ficheros, no llama a `git` y no consulta el reloj. Por eso los tests la
  ejercitan sin mocks. Todo acceso al exterior vive en `readEnv` y en `main`.
- **Un segmento, una función `render*`.** Devuelve el texto del segmento, o
  `null` si no hay nada que pintar.
- **Todo acceso al JSON va con `?.` y valor por defecto.** Un campo ausente
  degrada su segmento, no rompe el render.
- **Exports:** solo `render` y `bar`, que son lo que usan los tests.

## Decisiones técnicas

- **`project_dir` antes que `current_dir`.** `project_dir` es donde arrancó
  Claude Code. `current_dir` sigue al cwd de la shell y cambia durante la sesión.
- **Hardening al leer flags** (`readSmallFile`): sin symlinks, máximo 64 bytes
  y whitelist de valores. Es el mismo criterio que usa `caveman-badge.js`.
- **`git` nunca bloquea ni ensucia:** `--no-optional-locks`, timeout y stderr
  descartado. Si falla, devuelve `null` y el segmento se omite.
- **Gradiente por posición, no por valor.** El color de cada bloque de una barra
  depende de su posición en la barra (verde, amarillo, rojo). El color del
  porcentaje sí depende del valor (`levelColor`).

## Referencia externa

[ccstatusline](https://github.com/sirmalloc/ccstatusline) se puede consultar
para ver cómo resuelve un segmento. No se copia su arquitectura de widgets
configurables mientras la configurabilidad no entre en el roadmap.
