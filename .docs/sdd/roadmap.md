# Roadmap — statusline

## Estado

El producto se queda como está (ver `mission.md`). Lo que sigue son módulos
identificados sin compromiso de fecha ni de orden. La partición fina en tasks
se hace cuando `capabilities/` madure.

## Releases

### v1.0.0 — 2026-09-20 (publicada)

Primera release: la versión inicial del statusline, la init SDD con cuatro
capacidades y los patches `worktree-name` e `installer-update`. Sin pendientes
vivos: todo su scope estaba hecho al abrirla.

[release notes](releases/v1.0.0/release-notes.md) · [changelog](changelog.md) · [acta](releases/v1.0.0/feedback.md)

smoke: 2026-09-20 · 1 hallazgo (el bug de `install.ps1`, corregido dentro de la release)

## Módulos identificados

| Módulo | Qué es | Estado |
| --- | --- | --- |
| Avisos de cuota | Icono de alerta en las ventanas de 5h y semanal, como el del contexto. El color del porcentaje ya existe. | Pendiente (regla 4 de `constitution.md`) |
| Errores visibles | Marcador discreto (`⚠`) cuando un segmento falla, en vez de omitirlo sin avisar. | Pendiente (regla 4) |
| Presupuesto de tiempo | Tope de tiempo total del render, comprobado con un test. Sin cifra todavía. | Pendiente (regla 3) |
| README bilingüe | Castellano e inglés. La forma (un fichero o dos) la decide su task. | Pendiente (regla 2) |
| Configurabilidad | Elegir qué segmentos se ven, en qué orden y en cuántas líneas. | Sin compromiso |
| Segmentos nuevos | Sin lista concreta todavía. | Sin compromiso |
| Lanzador para macOS y Linux | Hoy se configura a mano. | Sin compromiso |

## Deuda técnica

| Deuda | Impacto | Vía de mejora |
| --- | --- | --- |
| `readGit` hace hasta 3 llamadas a `git`, cada una con 2 s de timeout | 6 s de bloqueo en el peor caso, en cada refresco | Una sola llamada a `git` que devuelva todo, o un timeout global. Es lo que acota el módulo «Presupuesto de tiempo». |
| Requisitos sin test: stdin inválido, perfil, detached HEAD, valor y hardening de flags, precedencia de `project_dir`, color del porcentaje, y `statusline.cmd` (`install.ps1` tiene test desde el patch `installer-update`) | Un cambio puede romperlos sin que `node statusline.test.js` lo detecte. Cada capacidad marca su cobertura. | Tests de `readEnv` con un directorio temporal como perfil; para el instalador, un test de PowerShell o una comprobación manual documentada. |
| Con stdin inválido la L1 empieza con un segmento de ubicación vacío (` │ 🤖 ?`) | Cosmético | Omitir el segmento de ubicación si no hay directorio de proyecto. |
| `statusline.cmd` elige la versión de Node de proto por orden alfabético del nombre de carpeta, no por SemVer | Hoy elige bien (`26.9.0`). Una `9.x` instalada ganaría a una `26.x`. | Ordenar por versión, o respetar la versión fijada por proto. |

## Issues de GitHub

Un issue se triagea y acaba como fila de «Módulos identificados» o de «Deuda
técnica», con su referencia (`#N`). Los issues no sustituyen a este roadmap.

## Patches

| Fecha | Patch | Rama | Carpeta |
| --- | --- | --- | --- |
| 2026-09-20 | 0000 — el worktree se pinta con el id interno de git | `chore/worktree-name` | `20260920-160436-patch-0000-worktree-name` |
| 2026-09-20 | 0000 — `install.ps1` falla al escapar la ruta y no distingue un update | `chore/installer-update` | `20260920-161940-patch-0000-installer-update` |
