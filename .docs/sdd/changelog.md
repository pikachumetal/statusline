# Changelog

## [Unreleased]

## [1.0.0] - 2026-09-20

Primera release. Documenta lo hecho hasta la fecha.

### Added

- Statusline de dos líneas para Claude Code. L1: perfil, repo, branch, worktree, modelo y effort, modos caveman y ponytail, velocity. L2: reloj de sesión, contexto, ventana de 5h, ventana semanal y coste, con barras de gradiente truecolor.
- Instalador para Windows (`install.ps1`) con soporte de varios perfiles (`-ConfigDir`) y lanzador `statusline.cmd`.
- Documentación de anclaje SDD en `.docs/sdd/` y cuatro capacidades: `input`, `session-state`, `usage` e `installation`.

### Fixed

- `install.ps1` ya no falla al escapar la ruta: el bloque `statusLine` que muestra salía con la ruta vacía. Al reinstalar sobre un perfil ya configurado informa de que está actualizado y no pide pegar nada. ([patch](specs/20260920-161940-patch-0000-installer-update/patch.md))
- El worktree se pinta con el nombre de su carpeta en lugar del id interno de git (`52744-ad47b0e3-…`), y dentro de un worktree el repo se pinta con el nombre del repo principal. Requiere git 2.31 o superior. ([patch](specs/20260920-160436-patch-0000-worktree-name/patch.md))
