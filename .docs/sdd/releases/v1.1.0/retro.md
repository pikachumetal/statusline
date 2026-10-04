# Retro — v1.1.0

> Retro de la release, pedida por el dev-lead al cerrar («Sí, breve»). Los números salen de `estimation-log.md`.

## 1. Retro

- **Agregado de la release**: 16 artefactos (8 features y 8 patches), 4,75 h reales. En las 8 features con estimación: estimado 2,5 h · real 2,3 h (ratio 0,92; mediana 1). Ninguna infraestimada.
- **Comprobación de los action items de la release anterior**:
  - **[A1] Commits con rutas explícitas, nunca `git add -A`** — aplicado: todos los commits de la release usan rutas explícitas; `.claude/settings.json` (cambio del usuario) solo entró en la migración del kit, a propósito y dicho en su mensaje.
  - **[A2] Test a los requisitos «sin test»** — aplicado: la feature 0002 los cubrió, con mutaciones; quedan sin test solo los detalles diferidos a la deuda técnica (Minor de la 0002).
  - **[A3] Una pregunta sin respuesta se vuelve a plantear** — aplicado: el dev-lead respondió todas las preguntas cerradas. Las decisiones tomadas sin preguntar son las del perfil `unattended`, que el dev-lead eligió para cada feature, y quedan registradas en cada walkthrough en «Decisiones tomadas sin el dev-lead».
- **Qué funcionó**:
  - Features de una sola task en Native, con revisión final de Sonnet: 8 features en ~2,3 h, ratio en torno a 1.
  - Las revisiones finales encontraron fallos reales que los tests no veían: el reloj `NaNm` (0013), la caída entera del statusline con un `project_dir` numérico (0006) y el saneado C1 del sufijo (0002 → patch 0017).
  - Las mutaciones en la 0002 detectaron un test propio que habría dado un falso rojo al azar.
- **Qué corregir**:
  - El perfil `unattended` difiere todas las validaciones al smoke de la release: este cierre acumula 13 validaciones pendientes. Una release más corta repartiría ese smoke.
  - Los Minor diferidos se fueron encadenando en filas de deuda «con la siguiente feature»; dos patches (0015, 0016) existieron solo para saldarlos.
  - Varios comandos de PowerShell los bloqueó un hook por falsos positivos (`del =`, `cmd /d`, `\*\*`), lo que costó reintentos.
  - `Merge-CapabilityDelta.ps1` borra la línea `> Cobertura:` al fusionar: 16 requisitos se quedaron sin ella.
- **Action items nuevos**:
  - [A4] Los Minor de una revisión final que solo añaden asserts o formato se aplican en la pasada de fix de la propia feature, no se difieren. Se verifica: la deuda técnica de la próxima release no tiene filas de «Minor de la revisión final» de tests o formato.
  - [A5] Releases más cortas: cerrar cuando haya 5 o menos validaciones diferidas. Se verifica: la línea `validaciones pendientes`/el smoke de la próxima release nombra 5 ids o menos.
  - [A6] Ticket al kit por el borrado de `> Cobertura:` en `Merge-CapabilityDelta.ps1`. Se verifica: existe el ticket en `kit-feedback/` o en el repo del kit.
