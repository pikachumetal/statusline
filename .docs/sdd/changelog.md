# Changelog

## [Unreleased]

### Added

- **0009** — Con Orca instalado (`~\.orca\agent-hooks\claude-statusline.cmd`), `install.ps1` copia y propone el wrapper `statusline-orca.cmd`, que pinta el statusline y reenvía el mismo JSON a Orca para que lea `rate_limits`. La integración entró sin registro SDD en `252c34c`; el patch la documenta. → [ref](specs/20261004-113838-patch-0009-orca-wrapper/)

### Changed

- **0013** — El segmento de coste añade el coste por hora a partir de 5 minutos de sesión (`💰 $0.47 · $2.35/h`). → [ref](specs/20261004-151215-feature-0013-cost-per-hour/)
- **0011** — Las barras de 5h y semanal pintan un marcador de ritmo (`┃`) en la celda del tiempo transcurrido de la ventana: si el relleno pasa de la marca, la cuota se gasta más rápido que el reloj. → [ref](specs/20261004-143157-feature-0011-pace-marker/)
- **0010** — Las barras del contexto, la ventana de 5h y la semanal pintan la celda de corte con un sub-bloque de octavos (`▏▎▍▌▋▊▉`): 8 veces más resolución con el mismo ancho. Un 34 % y un 38 % ya no se pintan igual. → [ref](specs/20261004-141040-feature-0010-sub-block-bars/)

- **0008** — La ventana semanal pinta el tiempo transcurrido (`⏳ 4d13h`) y la cuenta atrás hasta el reset (`↻2d10h`), en días y horas. → [ref](specs/20260920-215837-task-0008-weekly-reset/)

### Fixed

- **0013** — Un `total_cost_usd` no numérico ya no hace fallar el statusline: el coste se pinta como `$0.00`. → [ref](specs/20261004-151215-feature-0013-cost-per-hour/)
- **0008** — Un `resets_at` no numérico ya no pinta `NaN` en las ventanas de 5h y semanal: el segmento degrada como si el campo no estuviera. → [ref](specs/20260920-215837-task-0008-weekly-reset/)

## [1.0.0] - 2026-09-20

Primera release. Documenta lo hecho hasta la fecha.

### Added

- Statusline de dos líneas para Claude Code. L1: perfil, repo, branch, worktree, modelo y effort, modos caveman y ponytail, velocity. L2: reloj de sesión, contexto, ventana de 5h, ventana semanal y coste, con barras de gradiente truecolor. ([walkthrough retroactivo](specs/20260917-180410-task-0000-initial-version/walkthrough.md))
- Instalador para Windows (`install.ps1`) con soporte de varios perfiles (`-ConfigDir`) y lanzador `statusline.cmd`.
- Documentación de anclaje SDD en `.docs/sdd/` y cinco capacidades: `input`, `session-state`, `usage`, `installation` y `output`.

### Fixed

- `install.ps1` ya no falla al escapar la ruta: el bloque `statusLine` que muestra salía con la ruta vacía. Al reinstalar sobre un perfil ya configurado informa de que está actualizado y no pide pegar nada. ([patch](specs/20260920-161940-patch-0000-installer-update/patch.md))
- El worktree se pinta con el nombre de su carpeta en lugar del id interno de git (`52744-ad47b0e3-…`), y dentro de un worktree el repo se pinta con el nombre del repo principal. Requiere git 2.31 o superior. ([patch](specs/20260920-160436-patch-0000-worktree-name/patch.md))
