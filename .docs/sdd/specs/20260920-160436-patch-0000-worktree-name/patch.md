---
id: 20260920-160436-patch-0000-worktree-name
task: 0000
title: Patch — el worktree se pinta con el id interno de git
type: patch
status: done
created: 2026-09-20
branch: chore/worktree-name
commit: <pendiente>
---

# Patch 0000 — el worktree se pinta con el id interno de git

## 1. Síntoma

Reportado por el usuario, con captura: «los worktrees los veo como ids guid».

```
0006a  feature/0006a 🌳 52744-ad47b0e3-d019-4bf4-9c1b-5f90bf2b4a87 │ 🤖 Fable 5.1 (medium) │ …
```

Segundo síntoma, visible en la misma captura y no reportado: el nombre del repo
sale como `0006a` en lugar de `sdd-project-template`.

## 2. Causa raíz

`readGit` pintaba como nombre de worktree el valor del JSON de Claude Code
(`worktree.name`, o si falta, `workspace.git_worktree`) sin transformarlo. Ese
valor es el identificador interno que git da al worktree en `.git/worktrees/<id>`,
no el nombre de su carpeta.

Evidencia, en el repo de la captura (`D:\code\git\sdd-project-template`):

- `git worktree list` sitúa el worktree en `D:/code/.worktrees/sdd-project-template/0006a`.
- Su carpeta interna es `.git/worktrees/52744-ad47b0e3-d019-4bf4-9c1b-5f90bf2b4a87`: la cadena exacta de la captura. El otro worktree (`0009`) sigue el mismo patrón (`13420-ff41ecfc-…`).
- Git nombra esa carpeta interna como la carpeta del worktree en el momento de crearlo. Aquí los worktrees se crean con un nombre temporal y después se mueven, así que el id interno conserva el nombre temporal. Con worktrees creados a mano el bug no se ve.
- Reproducido pasando ese JSON a `statusline.js`: salida idéntica a la captura.

El segundo síntoma tiene la misma raíz: el repo salía de `git rev-parse --show-toplevel`,
que dentro de un worktree enlazado devuelve la carpeta del worktree, no la del repo principal.

## 3. Fix

- **Fichero(s)**: `statusline.js`, `statusline.test.js`.
- **Cambio**: `readGit` pide a git, en una sola llamada, las rutas absolutas de `--show-toplevel`, `--git-common-dir` y `--git-dir`. La función pura nueva `gitNames` saca de ellas el nombre del repo principal y, solo si `git-dir` difiere de `common-dir` (worktree enlazado), el nombre de la carpeta del worktree. El valor del JSON deja de usarse.
- **Decisión del usuario (opción A)**: para el nombre del worktree manda `git`, no el stdin. Es una excepción a la regla 5 de `constitution.md`, anotada allí.
- **Llamadas a git**: las mismas que antes (la nueva sustituye a la anterior).
- **Requisito nuevo**: `--path-format=absolute` exige git 2.31 o superior (marzo de 2021).

## 4. Verificación

Todo verificado por el agente. Falta la confirmación visual del usuario en una sesión real dentro de un worktree.

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | Test nuevo en RED antes del fix | ✅ `TypeError: gitNames is not a function` |
| 2 | `node statusline.test.js` tras el fix (worktree, árbol principal, submódulo) | ✅ `statusline.test.js OK` |
| 3 | Worktree real `0006a` con el JSON de la captura | ✅ `sdd-project-template  feature/0006a 🌳 0006a` |
| 4 | Worktree real `0009` | ✅ `sdd-project-template  feature/0009 🌳 0009` |
| 5 | Repo principal, y una subcarpeta suya | ✅ `sdd-project-template  develop`, sin 🌳 |
| 6 | Directorio sin git | ✅ solo el nombre del directorio |

## 5. Tiempo (ligero)

- Real: 0.5h (aproximado)
