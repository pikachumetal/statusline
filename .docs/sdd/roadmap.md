# Roadmap — statusline

## Próximo

| # | Ítem | Estado |
| --- | --- | --- |

## Release 2.0.0

en preparación

| id | Feature | Origen | Ficheros que toca | Estado |
| --- | --- | --- | --- | --- |
| 0022 | Segmentos con nombre y render guiado por un layout, con el de la v1.2.0 por defecto y sin cambio visible · `proposal: 0021` | B1 del backlog | `statusline.js` (`renderLine1`, `renderLine2`, `render`), `statusline.test.js` | 🧪 validación diferida a smoke de la release 2.0.0 |
| 0023 | `statusline.json` en el perfil: lectura endurecida, validación, `⚠`, N líneas y formato en el README · `proposal: 0021` · tras 0022 | B1 del backlog | `statusline.js` (`readEnv`), `statusline.test.js`, `README.md`, `README.en.md` | 🧪 validación diferida a smoke de la release 2.0.0 |
| 0024 | Mod de controles bajo la status line: selectores de modelo, effort, caveman y ponytail, coste en vivo, estado de tests y Board; `install.ps1` lo instala | Petición del usuario el 2026-10-17 | `mod/`, `.claude-plugin/marketplace.json`, `install.ps1`, `statusline.test.js`, `README.md`, `README.en.md`, `.docs/sdd/` | 🧪 validación diferida a smoke de la release 2.0.0 |
| 0026 | Patch: `install.ps1` no copia los ficheros idénticos ([patch](specs/20261017-220851-patch-0026-install-skip-identical/patch.md)) | B5 del backlog | `install.ps1`, `statusline.test.js` | 🧪 validación diferida a próximo update de la status line, a cargo del dev-lead |

## Backlog

| # | Ítem | Origen |
| --- | --- | --- |
| B1 | **[Feature 0023, 2026-10-17: saldada — [walkthrough](specs/20261017-181144-feature-0023-statusline-json/walkthrough.md)]** Configurabilidad: elegir qué segmentos se ven, en qué orden y en cuántas líneas. Planificada en la Release 2.0.0 como 0022 y 0023 (`proposal: 0021`). | Módulo identificado |
| B2 | Segmentos nuevos. Sin lista concreta todavía. | Módulo identificado |
| B3 | Lanzador para macOS y Linux. Hoy se configura a mano. | Módulo identificado |
| B4 | % de uso de Fable en la ventana semanal: porcentaje del bucket semanal de Fable en la L2. **Bloqueado:** el stdin del statusline solo trae `five_hour`, `seven_day` y `spend_limit`; los buckets por modelo (`model_scoped`) no se proyectan y el store vive en memoria de Claude Code. Revisar si una versión futura proyecta `model_scoped`. | Módulo identificado |
| B5 | **[Patch 0026, 2026-10-18: saldada — [patch](specs/20261017-220851-patch-0026-install-skip-identical/patch.md)]** Instalador que se salta los ficheros idénticos: hoy un update con una sesión abierta falla al copiar `statusline.cmd` en uso aunque no haya cambiado (la 0020 lo hace fallar con error en vez de darlo por copiado). | Visto al instalar la v1.2.0 en local |

## Deuda técnica

| Ítem | Impacto | Destino |
| --- | --- | --- |
| **[Feature 0023, 2026-10-17: saldada — [walkthrough](specs/20261017-181144-feature-0023-statusline-json/walkthrough.md)]** Minors aplazados de la 0022: el comentario de `SEGMENTS` roza repetir el código; el test «layout explícito = sin layout» pasa por construcción; la cabecera de `statusline.js` dice «dos líneas» ([walkthrough](specs/20261017-144436-feature-0022-named-segments/walkthrough.md)) | Bajo: legibilidad | **Actuar**: con la 0023 |
| Minors aplazados de la 0023: el test «un perfil por fichero» es más débil que su THEN; `^statusline\b` en dos tests depende de cómo se llame la carpeta del clon; falta un test del fallback a `~/.claude` sin `CLAUDE_CONFIG_DIR` ([walkthrough](specs/20261017-181144-feature-0023-statusline-json/walkthrough.md)) | Bajo: solo de test | **Actuar**: patch |
| Minors aplazados de la 0024: `isTestCommand` detecta el runner en cualquier posición (`cat jest.config.js` cuenta); `modelName` lee una fecha como versión menor; un fallo pasajero de un comando se avisa como «not available»; el recorte a 80 caracteres puede partir un emoji; falta test de la fila tras `/model` y `/caveman`; faltan dos asserts del plan en los tests del instalador; `-ConfigDir ~\.claude` y rutas relativas no se resuelven antes de comparar ([walkthrough](specs/20261017-124615-feature-0024-controls-mod/walkthrough.md)) | Bajo: casos raros o solo de test | **Actuar**: patch |

## Patches

| Fecha | Id | Descripción |
| --- | --- | --- |
| 2026-10-18 | 0026 | 🧪 validación diferida a próximo update de la status line, a cargo del dev-lead — `install.ps1` no copia los ficheros idénticos ([patch](specs/20261017-220851-patch-0026-install-skip-identical/patch.md)) |
| 2026-10-18 | 0025 | El coste sale de la fila del mod y la status line lo pinta en `#d19a66` ([patch](specs/20261017-215404-patch-0025-cost-to-statusline/patch.md)) |

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
