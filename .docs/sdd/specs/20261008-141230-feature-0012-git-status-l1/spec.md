---
id: 20261008-141230-feature-0012-git-status-l1
feature: 0012
title: Estado de git en la L1
mode: full
profile: unattended
status: approved
created: 2026-10-08
author: Claude (unattended)
approvers:
  - role: dev-lead
    name: Àngel Delgado
    approved_at: null
---

# Spec — Estado de git en la L1

## Capacidades

- Modificadas: `session-state` — «Ubicación con git», «Ubicación en detached HEAD» y «Ubicación sin git»: la rama lleva `●` y `↑N↓M`, el hash corto sale de `git status` y un `git` que agota el presupuesto pinta `⚠`.
- Modificadas: `input` — «Consulta a git»: dos llamadas fijas (rutas y `git status --porcelain=v2 --branch`) y el presupuesto agotado se distingue de un fallo.

## Decisiones que he tomado yo — valida estas

Review de spec propuesta: ninguna — señales: MODIFIED (tres requisitos de `session-state`, uno de `input`) · tamaño: ~60 líneas en 2 ficheros y 2 docs
- Mínimo razonable: ninguna — deja sin mirar por otro agente si el `⚠` por presupuesto choca con otro requisito de la L1; lo cubre el repaso de coherencia contra `session-state.md` e `input.md`

1. Carril feature, modo full y no lite: lite necesita la confirmación del dev-lead y el perfil vigente es `unattended`, de `sdd-kit.json`. Enunciado: la fila 0012 de la release 2.0.0. Prevé 2 tasks: no se parte.
2. **No sale todo de un solo `git status`.** Probado en un repo temporal con git 2.55: `git status --porcelain=v2 --branch` da `branch.oid`, `branch.head`, `branch.upstream` y `branch.ab`, pero no `--show-toplevel`, `--git-common-dir` ni `--git-dir`, que `gitNames` necesita para el nombre del repo principal y del worktree (el `.git/worktrees/<id>` de un worktree movido es ilegible, regla 5 de la constitution). Quedan dos llamadas fijas: `rev-parse` de rutas y `status`. `status` sustituye a `symbolic-ref --short HEAD` y a `rev-parse --short HEAD`: hoy son 2 o 3 llamadas, pasan a 2.
3. Hash corto en detached HEAD: los 7 primeros caracteres de `branch.oid`. `rev-parse --short` alarga el hash si 7 son ambiguos; con 7 fijos, en un repo enorme dos commits podrían compartir prefijo. Se acepta: es un indicador, no una referencia que se copie.
4. Cambios = cualquier entrada de `git status`: modificados, staged, sin seguimiento (`?`) y en conflicto (`u`). Un fichero nuevo sin `git add` es trabajo sin guardar. Los ignorados no cuentan (`status` no los lista sin `--ignored`).
5. Colores: `●` en amarillo (`220;200;0`, el del nivel medio): trabajo pendiente, sin alarma. `↑N↓M` en gris atenuado (`130;130;130`, el `dim` de los demás detalles), pegados (`↑2↓1`): es información, no aviso.
6. `↑0` y `↓0` no se pintan: cada flecha solo aparece con su contador mayor que cero. Sin upstream, con el upstream borrado (`branch.upstream` sin `branch.ab`) o en detached HEAD no hay `↑↓`.
7. Orden dentro del segmento de ubicación: repo, rama, `●`, `↑N↓M`, worktree. Las marcas van junto a la rama, que es lo que describen.
8. Presupuesto agotado = una llamada que no se lanza porque no queda plazo, o que vuelve vacía con el plazo ya vencido. Se detecta con el reloj dentro de `readGit`, sin cambiar el contrato del ejecutor de `git` inyectable (sigue devolviendo texto o `null`).
9. Con el presupuesto agotado se pinta el `⚠` de la 0006 (gris) en el sitio del estado: tras la rama si ya se sabía el repo, o tras el nombre del directorio si se agotó en las rutas. Cambia la decisión 4 de la 0001 («degrada como hoy, sin aviso»): lo pide el enunciado de la 0012. Un `git` que falla sin agotar el plazo (no es un repo, no está instalado) no pinta `⚠`: es un dato ausente (regla de producto 4).
10. `git status` sin `-uno`: listar los sin seguimiento cuesta tiempo en repos grandes, pero lo acota el presupuesto y, si se pasa, se ve `⚠`.
11. Repaso de coherencia: añadido el THEN de `git status` que falla con las rutas ya dadas (branch `?`, sin marcas ni `⚠`), que el borrador no cubría.
12. Al cerrar se actualiza `architecture.md` (flujo: `readGit` da repo, rama, worktree y estado).

## Intent

La L1 dice en qué rama está la sesión, pero no si hay trabajo sin commitear ni si la rama va por delante o por detrás de su upstream. Para saberlo hay que salir a la shell. Se quiere verlo junto a la rama con el mismo coste de `git` que hoy o menos, y que un `git` que agota el presupuesto se note.

## Scope

- Entra: `git()`/`readGit()` y `renderWhere()` en `statusline.js`; tests en `statusline.test.js`; `architecture.md` al cerrar.
- No entra: `git fetch` (el `↑↓` es contra el último upstream conocido en local), contar ficheros cambiados, stash, configurabilidad de colores o iconos (B1).

## Approach

`readGit` hace dos llamadas dentro del presupuesto de 2000 ms: las rutas y `git status --porcelain=v2 --branch`. De las cabeceras `#` sale la rama (o el hash si es `(detached)`) y `branch.ab`; cualquier línea que no empiece por `#` marca cambios. `readGit` devuelve además si el presupuesto se agotó. `renderWhere` pinta las marcas sin tocar el exterior: `render` sigue pura.

## Delta de comportamiento

### Capacidad: `session-state`

**MODIFIED — Ubicación con git** (antes: sin estado del working tree ni del upstream)

- GIVEN un directorio de proyecto dentro de un repo git
- WHEN se pinta la L1
- THEN se muestra el nombre del repo principal (la carpeta que contiene el `.git` común), el icono de branch y el nombre del branch
- AND si el working tree tiene cambios (modificados, staged, sin seguimiento o en conflicto), tras el branch se añade `●` en amarillo (`220;200;0`): `proj  main ●`
- AND si el branch tiene upstream, tras el branch (y tras `●` si lo hay) se añade en gris atenuado (`130;130;130`) `↑N` con N commits por delante y `↓M` con M por detrás, pegados, solo los que sean mayores que cero: `+2 -1` en `branch.ab` pinta `↑2↓1`, `+2 -0` pinta `↑2`, `+0 -0` no pinta nada
- AND sin upstream, con el upstream borrado o en detached HEAD no se pinta `↑` ni `↓`
- AND si el directorio está en un worktree enlazado, se añade `🌳` y el nombre de la carpeta del worktree, detrás de las marcas: `proj  main ● ↑2 🌳 feat-x`
- AND dentro de un worktree enlazado el repo sigue siendo el principal, no la carpeta del worktree
- AND el nombre del worktree sale de `git`, no del JSON: el JSON trae el id interno de git (`.git/worktrees/<id>`), que es ilegible si el worktree se movió tras crearse
- AND si `git` agota el presupuesto después de dar las rutas, tras el branch se pinta `⚠` en gris en lugar de `●` y `↑↓`, y el branch es `?`: `proj  ? ⚠`
- AND si `git status` falla sin agotar el presupuesto, el branch es `?`, sin `●`, `↑↓` ni `⚠`

**MODIFIED — Ubicación en detached HEAD** (antes: el hash corto lo daba `rev-parse --short`)

- GIVEN un repo en detached HEAD
- WHEN se pinta la L1
- THEN en lugar del nombre del branch se muestra el hash corto del commit: los 7 primeros caracteres de `branch.oid` (`abc1234def…` pinta `abc1234`)
- AND si tampoco se puede obtener el hash, se muestra `?`

**MODIFIED — Ubicación sin git** (antes: un `git` que no responde pintaba solo el nombre)

- GIVEN un directorio de proyecto que no es un repo git, o un `git` que falla
- WHEN se pinta la L1
- THEN se muestra solo el nombre del directorio, sin icono de branch, worktree ni `⚠`
- AND si `git` agota el presupuesto antes de dar las rutas, tras el nombre del directorio se pinta `⚠` en gris: `proj ⚠`
- AND sin directorio de proyecto (stdin vacío o inválido) el segmento no aparece, ni su separador

### Capacidad: `input`

**MODIFIED — Consulta a git** (antes: rama con `symbolic-ref` y `rev-parse --short`; el presupuesto agotado devolvía vacío)

- GIVEN un directorio de proyecto
- WHEN el statusline consulta `git`
- THEN hace como mucho dos llamadas: `rev-parse --path-format=absolute --show-toplevel --git-common-dir --git-dir` y, si la primera da rutas, `status --porcelain=v2 --branch`
- AND cada llamada usa `--no-optional-locks` y descarta stderr
- AND todas las llamadas de un refresco comparten un presupuesto de 2000 ms: cada una tiene como timeout lo que queda, y si no queda nada no se lanza
- AND con un `git` que tarda 1500 ms en dar las rutas y no responde a lo demás, la consulta entera acaba en 2000 ms o menos, no en 5500 ms, y queda marcada como presupuesto agotado
- AND si `git` no existe, falla o el directorio no es un repo, la consulta devuelve vacío y no se propaga ningún error; si agota el presupuesto, devuelve lo que llegó a tiempo y la marca de presupuesto agotado
- AND el statusline completo, lanzado en este repo, termina en menos de 3000 ms

## Enmiendas

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
| --- | --- | --- | --- |
| agente (unattended) | Claude | 2026-10-08 | aprobada con las decisiones registradas |
