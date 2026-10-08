# Roadmap — statusline

## Próximo

| # | Ítem | Estado |
| --- | --- | --- |

## Release 2.0.0

en preparación

| id | Feature | Origen | Ficheros que toca | Estado |
| --- | --- | --- | --- | --- |
| 0012 | Estado de git en la L1: `●` con cambios y `↑↓` frente al remoto, con lo que devuelve un solo `git status --porcelain=v2 --branch` · tras 0001 | Petición del usuario el 2026-10-04 | `statusline.js` (`readGit`, render de la L1), `statusline.test.js` | 🧪 validación diferida a smoke de la release 2.0.0 |
| 0018 | Patch: el `↻` semanal pinta `1d00h` y no `24h00m` justo por debajo de 24 h | Deuda técnica | `statusline.js` (`fmtSpan`), `statusline.test.js` | 🧪 validación diferida a smoke de la release 2.0.0 |
| 0019 | Patch: tests que faltaban tras la 0002 (colores atenuados y velocity, `cwd` de `git`, wrapper de Orca) | Deuda técnica | `statusline.test.js` | 🧪 validación diferida a smoke de la release 2.0.0 |
| 0020 | Patch: `install.ps1` se para si falla la copia de un fichero, sin dar los ficheros por copiados | Deuda técnica | `install.ps1`, `statusline.test.js` | 🧪 validación diferida a smoke de la release 2.0.0 |

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

## Patches

| Fecha | Id | Descripción |
| --- | --- | --- |
| 2026-10-08 | [0018](specs/20261008-145214-patch-0018-weekly-reset-24h/) | 🧪 validación diferida a smoke de la release 2.0.0 — el `↻` semanal pinta `1d00h` y no `24h00m` cuando faltan algo menos de 24 h |
| 2026-10-08 | [0019](specs/20261008-152437-patch-0019-missing-0002-tests/) | 🧪 validación diferida a smoke de la release 2.0.0 — tienen test los colores atenuados y velocity, el `cwd` que recibe `git` y el wrapper de Orca con y sin hook |
| 2026-10-08 | [0020](specs/20261008-161514-patch-0020-install-copy-error/) | 🧪 validación diferida a smoke de la release 2.0.0 — `install.ps1` se para con código 1 y un error que nombra el fichero si no puede copiarlo, sin imprimir «Ficheros copiados» |

## Releases cerradas

### v1.1.0 — 2026-10-05

Presupuesto de tiempo de `git` (0001), tests de los requisitos sin cobertura (0002), icono de nivel en las ventanas de cuota (0005), marcador `⚠` cuando un segmento falla (0006) y README en castellano e inglés (0007). Entran también, planificadas para la 2.0.0 y ya integradas: barras con sub-bloques (0010), marcador de ritmo (0011) y coste por hora (0013). Ya estaban cerradas al abrirla la cuenta atrás semanal (0008) y el registro del wrapper de Orca (0009). Patches: 0003, 0004, 0014, 0015, 0016 y 0017. Antes, la migración del kit SDD de la 1.1.0 a la 2.3.1. El estado de git en la L1 sigue en la 2.0.0.

[changelog](changelog.md) · [retro](releases/v1.1.0/retro.md)

smoke: 2026-10-05 · 0 hallazgos (suite completa en 7 s; lanzador instalado con un caso real, stdin `null` y `project_dir` numérico; guion del dev-lead en su sesión; 0 corregidos)

### v1.0.0 — 2026-09-20

Primera release: la versión inicial del statusline (con walkthrough
retroactivo), la init SDD con cinco capacidades y los patches `worktree-name` e `installer-update`. Sin pendientes
vivos: todo su scope estaba hecho al abrirla.

[release notes](releases/v1.0.0/release-notes.md) · [changelog](changelog.md) · [acta](releases/v1.0.0/feedback.md)

smoke: 2026-09-20 · 1 hallazgo (el bug de `install.ps1`, corregido dentro de la release)
