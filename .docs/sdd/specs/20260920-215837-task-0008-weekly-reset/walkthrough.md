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
- Commit: `4eadd11`.

## 2. Tiempo: estimado vs real

- Tipo: infra/tooling
- Estimación de implementación (de la spec, modo lite): 1h
- Esfuerzo real: 0.5h (aproximado: de la aprobación de la spec al commit `4eadd11`,
  más la instalación en los dos perfiles y la validación)
- Desviación: −0.5h (−50 %)
- Causa de la desviación: el cambio resultó más pequeño de lo estimado. `render` es
  pura y los tres casos nuevos se escribieron sin mocks ni fixtures, y el segmento
  ya existía: el diff real fue un helper de formato y una función de segmento. La
  estimación asumió más fricción en el formato de días de la que hubo.
- Review de spec: no (modo lite)

## 3. Desviaciones del plan

- No hay `plan.md`: la task fue en modo lite. Frente a la spec, ninguna desviación.

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
  real, en los dos perfiles, y confirmó que el segmento `7d` se ve bien.

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | `seven_day` con reset a más de 24 h | `⏳ 6d00h` y `↻1d00h` |
| 2 | `seven_day` con reset a 2 h | `⏳ 6d22h` y `↻2h00m` (formato corto por debajo de 24 h) |
| 3 | `seven_day` sin `resets_at` | Solo `7d`, barra y `38%`; sin `⏳` ni `↻` |
| 4 | Ventana de 5h y reloj de sesión | Sin cambios (`⏳ 1h23m`, `↻00:45`, `⏱️ 12m`) |
| 5 | Instalación en los dos perfiles | Ficheros copiados, update detectado, `settings.json` intacto |

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
