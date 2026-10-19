# Roadmap — statusline

## Próximo

| # | Ítem | Estado |
| --- | --- | --- |

## Backlog

| # | Ítem | Origen |
| --- | --- | --- |
| B2 | Segmentos nuevos. Sin lista concreta todavía. | Módulo identificado |
| B3 | Lanzador para macOS y Linux. Hoy se configura a mano. | Módulo identificado |
| B4 | % de uso de Fable en la ventana semanal: porcentaje del bucket semanal de Fable en la L2. **Bloqueado:** el stdin del statusline solo trae `five_hour`, `seven_day` y `spend_limit`; los buckets por modelo (`model_scoped`) no se proyectan y el store vive en memoria de Claude Code. Revisar si una versión futura proyecta `model_scoped`. | Módulo identificado |

## Deuda técnica

| Ítem | Impacto | Destino |
| --- | --- | --- |
| Minors aplazados de la 0023: el test «un perfil por fichero» es más débil que su THEN; `^statusline\b` en dos tests depende de cómo se llame la carpeta del clon; falta un test del fallback a `~/.claude` sin `CLAUDE_CONFIG_DIR` ([walkthrough](specs/20261017-181144-feature-0023-statusline-json/walkthrough.md)) | Bajo: solo de test | **Actuar**: patch |
| Minors aplazados de la 0024: `isTestCommand` detecta el runner en cualquier posición (`cat jest.config.js` cuenta); `modelName` lee una fecha como versión menor; un fallo pasajero de un comando se avisa como «not available»; el recorte a 80 caracteres puede partir un emoji; falta test de la fila tras `/model` y `/caveman`; faltan dos asserts del plan en los tests del instalador; `-ConfigDir ~\.claude` y rutas relativas no se resuelven antes de comparar ([walkthrough](specs/20261017-124615-feature-0024-controls-mod/walkthrough.md)) | Bajo: casos raros o solo de test | **Actuar**: patch |

## Patches

| Fecha | Id | Descripción |
| --- | --- | --- |

## Releases cerradas

### v2.1.2 — 2026-10-19

El README explica cómo instalar solo el mod desde el marketplace de GitHub. Sin cambios de comportamiento.

[changelog](changelog.md)

### v2.1.1 — 2026-10-19

El mod de controles declara la versión del repo en su `plugin.json` (estaba en `0.1.0`). Sin cambios de comportamiento.

[changelog](changelog.md)

smoke: 2026-10-19 · 0 hallazgos (`claude plugin validate mod`, suite completa y `claude plugin test mod` sobre `develop`; 0 corregidos)

### v2.1.0 — 2026-10-19

Mod de controles: la fila pasa a la banda sobre el prompt y la pastilla «N shells» de Claude Code vuelve a ser clicable (0028); modelo a la izquierda y `🧪 [passed] | 🗿 [caveman] | 🦥 [full] [Board]` a la derecha, con corchetes en lo que se pulsa (0029); `[folder]` y `[code]` abren la carpeta de la sesión en el explorador y en VS Code, con iconos de Nerd Font en el terminal y emoji en el escritorio, y la fila ocupa el ancho de la banda (0030).

[changelog](changelog.md)

smoke: 2026-10-19 · 0 hallazgos (suite completa y `claude plugin test mod` sobre `develop`; uso del dev-lead en el terminal y en el addon de VS Code tras `/reload-plugins`: «chulo»; 0 corregidos)

### v2.0.0 — 2026-10-18

Configurabilidad (B1): segmentos con nombre y `render` guiado por un layout (0022) y `statusline.json` por perfil, con validación y `⚠` (0023). Mod de controles bajo la status line, con selectores de modelo, effort, caveman y ponytail, estado de los tests y Board (0024). Patches: el coste sale del mod y la status line lo pinta en `#d19a66` (0025), `install.ps1` no copia los ficheros idénticos (0026, B5) y el test del fichero en uso suelta el bloqueo por señal (0027). Sale como 2.0.0 por decisión del dev-lead: sin `statusline.json` la salida es la de la 1.2.0. Antes, la migración del kit SDD a la 2.3.4.

[changelog](changelog.md)

smoke: 2026-10-18 · 0 hallazgos (suite completa y `claude plugin test mod` sobre `develop`; uso diario del dev-lead en `~/.claude` y `~/.claude-gco` con su `statusline.json` y el mod; `install.ps1` con la sesión abierta; 0 corregidos)

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
