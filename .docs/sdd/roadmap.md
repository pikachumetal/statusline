# Roadmap — statusline

## Estado

`v1.0.0` publicada. La siguiente release es `v1.1.0`, con el scope decidido por
el usuario el 2026-09-20. Los módulos grandes quedan como candidatos a una
`v2.0.0`, sin compromiso.

## Releases

### v1.1.0 — en preparación

Scope decidido por el usuario el 2026-09-20. Sin fecha y sin bloqueos. El orden
es por riesgo primero y por coste-beneficio después. Las tasks se arrancan de
una en una con `sdd-start-task`; los patches, con `sdd-start-patch`.

| # | Item | Origen | Carril | Estado |
| --- | --- | --- | --- | --- |
| 1 | `readGit` sin bloqueo de hasta 6 s, y presupuesto de tiempo total del render comprobado con un test | Deuda técnica + módulo «Presupuesto de tiempo» (regla 3) | Task | Pendiente |
| 2 | Dar test a los 10 requisitos marcados «sin test» en `capabilities/` | Action item A2 del [acta de la v1.0.0](releases/v1.0.0/feedback.md) + deuda técnica | Task | Pendiente |
| 3 | Con stdin inválido la L1 no empieza con un segmento vacío | Deuda técnica | Patch | Pendiente |
| 4 | `statusline.cmd` elige la versión de Node de proto por SemVer, no por nombre de carpeta | Deuda técnica | Patch | Pendiente |
| 5 | Icono de alerta en las ventanas de 5h y semanal | Módulo «Avisos de cuota» (regla 4) | Task | Pendiente |
| 6 | Marcador `⚠` cuando un segmento falla | Módulo «Errores visibles» (regla 4) | Task | Pendiente |
| 7 | README bilingüe | Módulo «README bilingüe» (regla 2) | Task | Pendiente |

Action items de proceso de la retro anterior, a comprobar al cerrar: A1 (commits
con rutas explícitas, nunca `git add -A`) y A3 (una pregunta sin respuesta se
vuelve a plantear, no se asume).

### v2.0.0 — candidata, sin compromiso

Configurabilidad, segmentos nuevos y lanzador para macOS y Linux. El usuario los
ve como «casi una v2.0.0». Ninguno está definido todavía.

### v1.0.0 — 2026-09-20 (publicada)

Primera release: la versión inicial del statusline (con walkthrough
retroactivo), la init SDD con cinco capacidades y los patches `worktree-name` e `installer-update`. Sin pendientes
vivos: todo su scope estaba hecho al abrirla.

[release notes](releases/v1.0.0/release-notes.md) · [changelog](changelog.md) · [acta](releases/v1.0.0/feedback.md)

smoke: 2026-09-20 · 1 hallazgo (el bug de `install.ps1`, corregido dentro de la release)

## Módulos identificados

| Módulo | Qué es | Estado |
| --- | --- | --- |
| Avisos de cuota | Icono de alerta en las ventanas de 5h y semanal, como el del contexto. El color del porcentaje ya existe. | En `v1.1.0` (item 5) |
| Errores visibles | Marcador discreto (`⚠`) cuando un segmento falla, en vez de omitirlo sin avisar. | En `v1.1.0` (item 6) |
| Presupuesto de tiempo | Tope de tiempo total del render, comprobado con un test. Sin cifra todavía. | En `v1.1.0` (item 1) |
| README bilingüe | Castellano e inglés. La forma (un fichero o dos) la decide su task. | En `v1.1.0` (item 7) |
| Configurabilidad | Elegir qué segmentos se ven, en qué orden y en cuántas líneas. | Candidato a `v2.0.0` |
| Segmentos nuevos | Sin lista concreta todavía. | Candidato a `v2.0.0` |
| Lanzador para macOS y Linux | Hoy se configura a mano. | Candidato a `v2.0.0` |

## Deuda técnica

| Deuda | Impacto | Vía de mejora | Release |
| --- | --- | --- | --- |
| `readGit` hace hasta 3 llamadas a `git`, cada una con 2 s de timeout | 6 s de bloqueo en el peor caso, en cada refresco | Una sola llamada a `git` que devuelva todo, o un timeout global. Es lo que acota el módulo «Presupuesto de tiempo». | `v1.1.0` (item 1) |
| Requisitos sin test: stdin inválido, perfil, detached HEAD, valor y hardening de flags, precedencia de `project_dir`, color del porcentaje, y `statusline.cmd` (`install.ps1` tiene test desde el patch `installer-update`) | Un cambio puede romperlos sin que `node statusline.test.js` lo detecte. Cada capacidad marca su cobertura. | Tests de `readEnv` con un directorio temporal como perfil; para el instalador, un test de PowerShell o una comprobación manual documentada. | `v1.1.0` (item 2) |
| Con stdin inválido la L1 empieza con un segmento de ubicación vacío (` │ 🤖 ?`) | Cosmético | Omitir el segmento de ubicación si no hay directorio de proyecto. | `v1.1.0` (item 3) |
| `statusline.cmd` elige la versión de Node de proto por orden alfabético del nombre de carpeta, no por SemVer | Hoy elige bien (`26.9.0`). Una `9.x` instalada ganaría a una `26.x`. | Ordenar por versión, o respetar la versión fijada por proto. | `v1.1.0` (item 4) |

## Issues de GitHub

Un issue se triagea y acaba como fila de «Módulos identificados» o de «Deuda
técnica», con su referencia (`#N`). Los issues no sustituyen a este roadmap.

## Patches

| Fecha | Patch | Rama | Carpeta |
| --- | --- | --- | --- |
| 2026-09-20 | 0000 — el worktree se pinta con el id interno de git | `chore/worktree-name` | `20260920-160436-patch-0000-worktree-name` |
| 2026-09-20 | 0000 — `install.ps1` falla al escapar la ruta y no distingue un update | `chore/installer-update` | `20260920-161940-patch-0000-installer-update` |
