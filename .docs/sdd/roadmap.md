# Roadmap — statusline

## Próximo

| # | Ítem | Estado |
| --- | --- | --- |

## Release 1.1.0

en preparación

| id | Feature | Origen | Ficheros que toca | Estado |
| --- | --- | --- | --- | --- |
| 0001 | `readGit` sin bloqueo de hasta 6 s, y presupuesto de tiempo total del render comprobado con un test | Deuda técnica + módulo «Presupuesto de tiempo» (regla 3) | `statusline.js` (`readGit`), `statusline.test.js` | ⏳ |
| 0002 | Dar test a los 10 requisitos marcados «sin test» en `capabilities/` | Action item A2 del [acta de la v1.0.0](releases/v1.0.0/feedback.md) + deuda técnica | `statusline.test.js` | ⏳ |
| 0003 | Con stdin inválido la L1 no empieza con un segmento vacío | Deuda técnica · patch | `statusline.js` (render de la L1) | ⏳ |
| 0004 | `statusline.cmd` elige la versión de Node de proto por SemVer, no por nombre de carpeta | Deuda técnica · patch | `statusline.cmd` | ⏳ |
| 0005 | Icono de alerta en las ventanas de 5h y semanal | Módulo «Avisos de cuota» (regla 4) | `statusline.js` (render de las ventanas) | ⏳ |
| 0006 | Marcador `⚠` cuando un segmento falla | Módulo «Errores visibles» (regla 4) | `statusline.js` (`render`) | ⏳ |
| 0007 | README bilingüe | Módulo «README bilingüe» (regla 2) | `README.md` | ⏳ |
| 0008 | Tiempo transcurrido y cuenta atrás de reset en la ventana semanal | Petición del usuario el 2026-09-20 | `statusline.js`, `statusline.test.js` | ✅ 2026-09-21 ([walkthrough](specs/20260920-215837-task-0008-weekly-reset/walkthrough.md)) |
| 0009 | Wrapper de Orca (`statusline-orca.cmd`): registro SDD de la integración de `252c34c`, test del instalador independiente de la máquina y excepción a la regla 1 | Petición del usuario el 2026-10-04 · patch | `install.ps1`, `statusline-orca.cmd`, `statusline.test.js` | ✅ 2026-10-04 ([patch](specs/20261004-113838-patch-0009-orca-wrapper/patch.md)) |

## Backlog

| # | Ítem | Origen |
| --- | --- | --- |
| B1 | Configurabilidad: elegir qué segmentos se ven, en qué orden y en cuántas líneas. | Módulo identificado, candidato a `v2.0.0` |
| B2 | Segmentos nuevos. Sin lista concreta todavía. | Módulo identificado, candidato a `v2.0.0` |
| B3 | Lanzador para macOS y Linux. Hoy se configura a mano. | Módulo identificado, candidato a `v2.0.0` |
| B4 | % de uso de Fable en la ventana semanal: porcentaje del bucket semanal de Fable en la L2. **Bloqueado:** el stdin del statusline solo trae `five_hour`, `seven_day` y `spend_limit`; los buckets por modelo (`model_scoped`) no se proyectan y el store vive en memoria de Claude Code. Revisar si una versión futura proyecta `model_scoped`. | Módulo identificado |

## Deuda técnica

| Ítem | Impacto | Destino |
| --- | --- | --- |
| `readGit` hace hasta 3 llamadas a `git`, cada una con 2 s de timeout | 6 s de bloqueo en el peor caso, en cada refresco | Actuar: una sola llamada a `git` que devuelva todo, o un timeout global. Es lo que acota el módulo «Presupuesto de tiempo». Feature 0001 |
| Requisitos sin test: stdin inválido, perfil, detached HEAD, valor y hardening de flags, precedencia de `project_dir`, color del porcentaje, y `statusline.cmd` (`install.ps1` tiene test desde el patch `installer-update`) | Un cambio puede romperlos sin que `node statusline.test.js` lo detecte. Cada capacidad marca su cobertura. | Actuar: tests de `readEnv` con un directorio temporal como perfil; para el instalador, un test de PowerShell o una comprobación manual documentada. Feature 0002 |
| Con stdin inválido la L1 empieza con un segmento de ubicación vacío (` │ 🤖 ?`) | Cosmético | Actuar: omitir el segmento de ubicación si no hay directorio de proyecto. Patch 0003 |
| `statusline.cmd` elige la versión de Node de proto por orden alfabético del nombre de carpeta, no por SemVer | Hoy elige bien (`26.9.0`). Una `9.x` instalada ganaría a una `26.x`. | Actuar: ordenar por versión, o respetar la versión fijada por proto. Patch 0004 |

## Patches

| Fecha | Id | Descripción |
| --- | --- | --- |
| 2026-10-04 | 0009 | Wrapper de Orca: registro SDD, test independiente de la máquina y excepción a la regla 1 · rama `chore/0009-orca-wrapper` · [patch](specs/20261004-113838-patch-0009-orca-wrapper/patch.md) |

## Releases cerradas

### v1.0.0 — 2026-09-20

Primera release: la versión inicial del statusline (con walkthrough
retroactivo), la init SDD con cinco capacidades y los patches `worktree-name` e `installer-update`. Sin pendientes
vivos: todo su scope estaba hecho al abrirla.

[release notes](releases/v1.0.0/release-notes.md) · [changelog](changelog.md) · [acta](releases/v1.0.0/feedback.md)

smoke: 2026-09-20 · 1 hallazgo (el bug de `install.ps1`, corregido dentro de la release)
