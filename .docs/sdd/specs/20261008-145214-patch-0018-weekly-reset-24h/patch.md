---
id: 20261008-145214-patch-0018-weekly-reset-24h
task: 0018
title: Patch — el ↻ semanal pinta 24h00m justo por debajo de 24 h
type: patch
solution: causa raíz
status: done
created: 2026-10-08
branch: patch/0018-weekly-reset-24h
commit: <hash>
---

# Patch 0018 — el ↻ semanal pinta 24h00m justo por debajo de 24 h

## Capacidades

- Modificadas: `usage` — «Formato de duración larga» redondea a minutos antes de elegir el formato.

## 1. Síntoma

Fila de deuda técnica del roadmap: «El `↻` semanal pinta `24h00m` cuando faltan algo menos de 24 h: `fmtDuration` redondea los minutos a 1440 y no pasa al formato en días». Medido: con el reset de `seven_day` a 23h59m30s, la L2 pinta `↻24h00m`.

## 2. Causa raíz

`fmtSpan` (`statusline.js`) elige el formato con `Math.floor(ms / 3600000) < 24`, es decir, con las horas truncadas, y en el formato corto delega en `fmtDuration`, que redondea a minutos (`Math.round(ms / 60000)`). Con 23h59m30s, la decisión ve 23 h y elige el corto, y `fmtDuration` redondea a 1440 min, que pinta `24h00m`. La decisión y lo que se pinta usan valores distintos.

Reproducido en RED: `reset a 86370s falta ↻1d00h: «… 7d ⏳ 6d00h ██████┃█ 38% ↻24h00m …»`.

## 3. Fix

- **Fichero(s)**: `statusline.js`, `statusline.test.js`
- **Cambio**: `fmtSpan` redondea a minutos una sola vez, decide el formato con ese valor (`mins < 24 * 60`) y saca las horas del formato largo de los mismos minutos. `fmtDuration` no cambia: también la usa el `⏳` de la L1.
- **Decisiones**:
  - Redondear a minutos antes de elegir el formato; 23h59m30s pinta `1d00h` — dev-lead
  - Las horas del formato largo salen de los minutos redondeados: `1d05h59m40s` pinta `1d06h` (antes `1d05h`) — dev-lead (consecuencia de «redondear una sola vez»)

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | RED: reset semanal a 23h59m30s | ✅ falla con `↻24h00m` |
| 2 | GREEN: 23h59m30s → `↻1d00h`; bordes 23h59m00s → `↻23h59m` y 24h → `↻1d00h` | ✅ `statusline.test.js OK` |

## 5. Tiempo (ligero)

- Real: 0,1h

## 6. Delta de capacidad

### Capacidad: `usage`

**MODIFIED — Formato de duración larga**
- GIVEN una duración en milisegundos
- WHEN se pinta el `⏳` o el `↻` de la ventana semanal
- THEN la duración se redondea a minutos y, a partir de 24 h, se muestra en días y horas (`4d12h`), con las horas redondeadas hacia abajo
- AND por debajo de 24 h se muestra en el formato corto ya existente (`4h16m` o `16m`)
- AND la duración que redondea a 24 h se pinta `1d00h`, nunca `24h00m`
