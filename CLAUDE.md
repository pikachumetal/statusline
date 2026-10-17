# statusline

Statusline de dos líneas para Claude Code (`statusline.js`, Node sin dependencias) y un mod de controles opcional en `mod/` (TypeScript que compila Claude Code ≥ 2.1.302).

## Documentos de anclaje (`.docs/sdd/`)

Léelos antes de tocar código. No dupliques aquí su contenido.

- `mission.md` — por qué existe, alcance y glosario.
- `constitution.md` — principios, las cinco reglas de producto, Git y proceso.
- `tech-stack.md` — tecnologías y decisiones abiertas.
- `architecture.md` — flujo y separaciones que hay que conservar.
- `roadmap.md` — módulos identificados, deuda y tabla de patches.
- `estimation.md` — método de estimación. `estimation-log.md` se genera, no se edita.
- `changelog.md` — changelog técnico.

Las plantillas de specs, plans y walkthroughs viven en el skill `sdd-templates` del kit, no en el repo.

## Reglas críticas

1. **Test primero.** `node statusline.test.js` y `claude plugin test mod` pasan antes de cada commit. Los tests en RED los escribe el hilo principal; un subagente solo los pone en GREEN y no toca los tests que recibe.
2. **Sin dependencias npm y sin estado propio.** `statusline.js`: solo Node y `git`. El mod: solo Claude Code, con su estado de sesión en memoria. Ninguno escribe ficheros.
3. **Nunca rompe y nunca pinta secretos.** Con stdin vacío o inválido pinta con valores por defecto.
4. **`render` es pura.** Todo acceso al exterior vive en `readEnv` y en `main`.
5. **git-flow.** `main` publicado con tag, `develop` desarrollo, ramas `feature/`, `release/`, `hotfix/` y `chore/`. Merge local con `--no-ff`.
