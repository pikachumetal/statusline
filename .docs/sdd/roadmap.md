# Roadmap — statusline

## Próximo

| # | Ítem | Estado |
| --- | --- | --- |

## Release 2.0.0

en preparación

| id | Feature | Origen | Ficheros que toca | Estado |
| --- | --- | --- | --- | --- |
| 0022 | Segmentos con nombre y render guiado por un layout, con el de la v1.2.0 por defecto y sin cambio visible · `proposal: 0021` | B1 del backlog | `statusline.js` (`renderLine1`, `renderLine2`, `render`), `statusline.test.js` | ⏳ |
| 0023 | `statusline.json` en el perfil: lectura endurecida, validación, `⚠`, N líneas y formato en el README · `proposal: 0021` · tras 0022 | B1 del backlog | `statusline.js` (`readEnv`), `statusline.test.js`, `README.md`, `README.en.md` | ⏳ |

## Backlog

| # | Ítem | Origen |
| --- | --- | --- |
| B1 | Configurabilidad: elegir qué segmentos se ven, en qué orden y en cuántas líneas. Planificada en la Release 2.0.0 como 0022 y 0023 (`proposal: 0021`). | Módulo identificado |
| B2 | Segmentos nuevos. Sin lista concreta todavía. | Módulo identificado |
| B3 | Lanzador para macOS y Linux. Hoy se configura a mano. | Módulo identificado |
| B4 | % de uso de Fable en la ventana semanal: porcentaje del bucket semanal de Fable en la L2. **Bloqueado:** el stdin del statusline solo trae `five_hour`, `seven_day` y `spend_limit`; los buckets por modelo (`model_scoped`) no se proyectan y el store vive en memoria de Claude Code. Revisar si una versión futura proyecta `model_scoped`. | Módulo identificado |
| B5 | Instalador que se salta los ficheros idénticos: hoy un update con una sesión abierta falla al copiar `statusline.cmd` en uso aunque no haya cambiado (la 0020 lo hace fallar con error en vez de darlo por copiado). | Visto al instalar la v1.2.0 en local |

## Deuda técnica

| Ítem | Impacto | Destino |
| --- | --- | --- |

## Patches

| Fecha | Id | Descripción |
| --- | --- | --- |

## Releases cerradas

### v1.2.0 — 2026-10-08

Estado de git en la L1: `●` con cambios y `↑↓` frente al upstream (0012). Patches: `↻` semanal a `1d00h` justo por debajo de 24 h (0018), tests que faltaban tras la 0002 (0019) e `install.ps1` parado si falla la copia de un fichero (0020). Se planificó como 2.0.0. Sale como 1.2.0 porque solo añade y corrige, sin romper compatibilidad. El 2.0.0 queda para la configurabilidad (B1), que sigue en el backlog con B2 y B3, sin versión candidata.

[changelog](changelog.md)

smoke: 2026-10-08 · 0 hallazgos (suite completa; L1 en un repo real por delante y por detrás del remoto, con cambios y sin upstream; `↻` con 23h59m55s; `install.ps1` con `statusline.cmd` bloqueado; 0 corregidos)

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
