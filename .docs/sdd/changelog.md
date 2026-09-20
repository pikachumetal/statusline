# Changelog

## [Unreleased]

### Changed

- **0008** — La ventana semanal pinta el tiempo transcurrido (`⏳ 4d13h`) y la cuenta atrás hasta el reset (`↻2d10h`), en días y horas. → [ref](specs/20260920-215837-task-0008-weekly-reset/)

## [1.0.0] - 2026-09-20

Primera release. Documenta lo hecho hasta la fecha.

### Added

- Statusline de dos líneas para Claude Code. L1: perfil, repo, branch, worktree, modelo y effort, modos caveman y ponytail, velocity. L2: reloj de sesión, contexto, ventana de 5h, ventana semanal y coste, con barras de gradiente truecolor. ([walkthrough retroactivo](specs/20260917-180410-task-0000-initial-version/walkthrough.md))
- Instalador para Windows (`install.ps1`) con soporte de varios perfiles (`-ConfigDir`) y lanzador `statusline.cmd`.
- Documentación de anclaje SDD en `.docs/sdd/` y cinco capacidades: `input`, `session-state`, `usage`, `installation` y `output`.

### Fixed

- `install.ps1` ya no falla al escapar la ruta: el bloque `statusLine` que muestra salía con la ruta vacía. Al reinstalar sobre un perfil ya configurado informa de que está actualizado y no pide pegar nada. ([patch](specs/20260920-161940-patch-0000-installer-update/patch.md))
- El worktree se pinta con el nombre de su carpeta en lugar del id interno de git (`52744-ad47b0e3-…`), y dentro de un worktree el repo se pinta con el nombre del repo principal. Requiere git 2.31 o superior. ([patch](specs/20260920-160436-patch-0000-worktree-name/patch.md))
