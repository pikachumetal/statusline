---
id: 20260920-215837-task-0008-weekly-reset
task: 0008
title: Walkthrough — Tiempo transcurrido y cuenta atrás de reset en la ventana semanal
spec: ./spec.md
status: done
created: 2026-09-21
---

# Walkthrough — Tiempo transcurrido y cuenta atrás de reset en la ventana semanal

## 1. Cambios realizados

- `statusline.js` — `renderSevenDay`, función de segmento propia y simétrica a
  `renderFiveHour`: pinta `⏳` con el transcurrido de la ventana semanal y `↻` con
  la cuenta atrás hasta `resets_at`. `renderLine2` pasa de construir el segmento
  en línea a delegar en ella.
- `statusline.js` — `fmtSpan`, helper de duración larga: días y horas a partir de
  24 h (`4d13h`), y el formato corto de `fmtDuration` por debajo. `fmtDuration` no
  se toca, así que el reloj de sesión y el `⏳` de la ventana de 5h no cambian.
- `statusline.js` — constante `SEVEN_DAYS_MS`.
- `statusline.test.js` — tres casos nuevos: reset a más de un día, reset a menos de
  24 h y `seven_day` sin `resets_at`.
- `.docs/sdd/roadmap.md` — fila `0008` en la `v1.1.0` y el % de Fable anotado como
  bloqueado en «Módulos identificados».
- `statusline.js` — `resetMs`, validación por tipo de `resets_at` (`Number.isFinite`),
  usada por las dos ventanas. Antes ambas comprobaban el campo por truthy y un valor
  no numérico pintaba `NaN`. Fuera del scope original: entró tras la code-review, con
  el visto bueno del usuario (ver §3).
- Commits: `4eadd11` (segmento semanal) y el del fix de `resets_at`.

## 2. Tiempo: estimado vs real

- Tipo: infra/tooling
- Estimación de implementación (de la spec, modo lite): 1h
- Esfuerzo real: 0.8h (aproximado: 0.5h hasta el commit `4eadd11` y la validación del
  usuario, más 0.3h de code-review y del fix de `resets_at` que salió de ella)
- Desviación: −0.2h (−20 %)
- Causa de la desviación: por debajo del umbral del ±30 %, no requiere causa. El
  segmento en sí salió más barato de lo estimado (`render` es pura, los tests van sin
  mocks y el segmento ya existía); lo que consumió la diferencia fue el bug que
  destapó la review.
- Review de spec: no (modo lite)
- Code-review del diff: 1 revisor (técnica, Sonnet) · hallazgos 3, aceptados 2

## 3. Desviaciones del plan

- No hay `plan.md`: la task fue en modo lite.
- **Scope ampliado tras la code-review.** El revisor encontró que `resets_at` no
  numérico (string, objeto, `NaN`) pasaba la comprobación por truthy y pintaba
  `⏳ NaNdNaNh … ↻NaNdNaNh`. Reproducido: el mismo fallo estaba ya en la ventana de
  5h (`⏳ NaNm ↻NaN:NaN`), preexistente a esta task. La causa raíz es la misma
  comprobación en los dos segmentos, así que arreglar solo el semanal habría dejado
  el bug vivo en pantalla. El usuario eligió arreglar ambos aquí; la spec quedó
  actualizada con el scope ampliado.
- Hallazgos de la review: 🔴 `resets_at` no numérico → aceptado y corregido con
  `resetMs`. 🟡 faltaban tests de `resets_at` inválido y de reset vencido → aceptado,
  ambos añadidos. 🔵 duplicación de esqueleto entre `renderFiveHour` y
  `renderSevenDay` → rechazado: es un refactor con su propio criterio y las dos
  funciones divergen en formato y en semántica del `↻`. No se abre deuda por ello;
  si aparece un tercer segmento de cuota, se replantea.

## 4. Verificación

### 4.1 Builds

- No aplica: no hay build. El proyecto es un fichero de Node sin dependencias.

### 4.2 Smoke / tests

- Verificado por el agente: `node statusline.test.js` → `statusline.test.js OK`.
  Primero en RED (`AssertionError: semanal falta ⏳ 6d00h`), luego en GREEN tras
  implementar — los tests se escribieron antes que el código.
- Verificado por el agente: render con un payload realista
  (`seven_day.resets_at` a 2 d 11 h) →
  `7d ⏳ 4d13h ████████ 77% ↻2d10h`.
- Verificado por el agente: instalación con `install.ps1` en `~/.claude` y en
  `~/.claude-gco`; el instalador detectó update en ambos y no reescribió
  `settings.json`. `fmtSpan` presente en las dos copias de `hooks/statusline.js`.
- Validado por el dev-lead: 2026-09-21 · miró el statusline instalado en su terminal
  real, en los dos perfiles, y confirmó que el segmento `7d` se ve bien. La validación
  es anterior al fix de `resets_at`, que es una degradación defensiva y no cambia lo
  que el usuario vio: con datos válidos la salida es idéntica (verificado por el
  agente con el mismo payload).

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | `seven_day` con reset a más de 24 h | `⏳ 6d00h` y `↻1d00h` |
| 2 | `seven_day` con reset a 2 h | `⏳ 6d22h` y `↻2h00m` (formato corto por debajo de 24 h) |
| 3 | `seven_day` sin `resets_at` | Solo `7d`, barra y `38%`; sin `⏳` ni `↻` |
| 4 | Ventana de 5h y reloj de sesión | Sin cambios (`⏳ 1h23m`, `↻00:45`, `⏱️ 12m`) |
| 5 | Instalación en los dos perfiles | Ficheros copiados, update detectado, `settings.json` intacto |
| 6 | `resets_at` no numérico (`'not-a-number'`, `{}`, `NaN`, `null`) en 5h y 7d | Solo etiqueta, barra y porcentaje; ni `NaN`, ni `⏳`, ni `↻` |
| 7 | `resets_at` ya vencido en 5h y 7d | Satura: `5h ⏳ 5h00m` y `7d ⏳ 7d00h ↻0m`, sin negativos |

### 4.3 Residuales / deuda generada

- El % de uso de Fable en el semanal queda **bloqueado**, no pendiente: el stdin del
  statusline solo proyecta `five_hour`, `seven_day` y `spend_limit`. Anotado en
  «Módulos identificados» del roadmap, para revisar si una versión futura de Claude
  Code proyecta `model_scoped`.
- Las horas de `fmtSpan` se truncan, no se redondean: con 2 d 10 h 59 m restantes
  pinta `↻2d10h`. Es el comportamiento habitual de una cuenta atrás y el usuario lo
  vio así. No se abre deuda.
- La L2 crece unas 13 columnas. Verificado en el terminal del usuario: cabe.

## 5. Aprendizajes

- Un campo del JSON comprobado por truthy no está validado: `if (x.resets_at)` deja
  pasar un string y pinta `NaN`. La regla 6 de `architecture.md` («todo acceso al JSON
  va con `?.` y valor por defecto») no cubría el tipo. Los campos numéricos del JSON
  se validan con `Number.isFinite` antes de operar con ellos →
  `.docs/sdd/architecture.md` (decisiones técnicas).
- El payload del statusline no es el del SDK ni el de los hooks: proyecta solo tres
  buckets de `rate_limits` (`five_hour`, `seven_day`, `spend_limit`), y los buckets
  por modelo no llegan. Antes de prometer un segmento nuevo, hay que comprobar el
  dato en el binario de Claude Code → `.docs/sdd/architecture.md` (flujo) y
  `capabilities/usage.md` (regla de la capacidad).
- Una duración de varios días no se puede pintar con `fmtDuration`: la ventana
  semanal necesita días. El helper nuevo se añadió aparte en vez de cambiar el
  existente, para no arrastrar el cambio al reloj de sesión →
  `capabilities/usage.md` (requisito «Formato de duración larga»).
- `.claude/skills/` del proyecto: revisado, no existe. Este trabajo no reveló
  ningún patrón reutilizable que justifique crear la primera skill — el flujo SDD
  del kit ya lo cubre.
