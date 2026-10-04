---
id: 20261004-204410-patch-0016-json-garbage
task: 0016
title: Patch — valores del JSON de tipo inesperado pintan basura
type: patch
solution: causa raíz
status: done
created: 2026-10-04
branch: chore/0016-json-garbage
commit: 911f08f
---

# Patch 0016 — valores del JSON de tipo inesperado pintan basura

## Capacidades

- Modificadas: `usage` — «Reloj de sesión», «Coste», «Ventana de 5h» y «Ventana semanal» tratan como ausente un valor no numérico o fuera de rango.
- Modificadas: `session-state` — «Velocity» cuenta como 0 un contador no numérico.

## 1. Síntoma

Dos filas de deuda técnica: el Important de la revisión final de la 0013 («`total_duration_ms` no numérico pinta `⏱️ NaNm`»), con el coste negativo y la basura que vio la revisión de la 0006; y los Minor de la 0006 (líneas en blanco y asserts del stdin). Medido el 2026-10-04 por stdin:

- `total_duration_ms: "x"` → `⏱️ NaNm`; `1e999` → `⏱️ InfinityhNaNm`
- `total_cost_usd: -1` → `💰 $-1.00`
- `total_lines_added: {}` → `+[object Object] -2`
- `five_hour.resets_at: 1e308` → `⏳ 0m ┃███████ 10% ↻NaN:NaN`

## 2. Causa raíz

Cuatro lecturas del JSON no siguen la regla de `architecture.md` («un campo numérico se valida con `Number.isFinite` antes de operar con él»): el reloj y velocity usan `|| 0`, que deja pasar un texto o un objeto; el coste valida `Number.isFinite` pero no el signo; y `resetMs` valida el epoch pero no que `epoch × 1000` sea una fecha válida (`1e308 × 1000` es `Infinity`; `new Date(Infinity)` da `NaN` en `fmtClock`). Ninguno lanza, así que la guarda de la 0006 no actúa.

## 3. Fix

- **Fichero(s)**: `statusline.js`, `statusline.test.js`
- **Cambio**: `count(n)` devuelve `n` si es finito y positivo y 0 si no; lo usan el reloj, el coste y velocity. `resetMs` devuelve `null` si el epoch no da una fecha válida. Se recuperan las líneas en blanco antes de `renderFiveHour` y `render`, y el bucle del stdin comprueba valores por defecto, ausencia de `⚠` y stderr vacío (Minor de la 0006).
- **Decisiones**:
  - Un valor no numérico, negativo o fuera de rango se trata como ausente (`0m`, `$0.00`, `+0`, sin `↻`), igual que hoy se trata un campo que falta — sin el dev-lead (lo fija la regla vigente de `architecture.md`; no hay texto ni sitio nuevos)

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | RED: `total_duration_ms: "x"` → `⏱️ 0m` | ✅ falla con `AssertionError: reloj con "x"` |
| 2 | GREEN: `node statusline.test.js` (reloj `x`/`1e999`/`{}`, coste −1, velocity con objeto, `resets_at` 1e308, sin `NaN`/`Infinity`/`undefined`/`object`) | ✅ `statusline.test.js OK` |
| 3 | Ejecución real: duración `1e999`, coste −1, añadidas `{}` | ✅ `+0 -2` / `⏱️ 0m … 💰 $0.00` |
| 4 | Ejecución real: `resets_at: 1e308` | ✅ `🟢 5h ▊███████ 10%`, sin `↻` ni marcador |

Validación diferida: 2026-10-04 · «ok! dale unattended» · disparador: smoke de la release 1.1.0, a cargo del dev-lead

## 5. Tiempo (ligero)

- Real: 0,3h

## 6. Delta de capacidad

### Capacidad: `usage`

**MODIFIED — Reloj de sesión**
- GIVEN un JSON con `cost.total_duration_ms`
- WHEN se pinta la L2
- THEN se muestra `⏱️` y la duración redondeada al minuto: `12m` por debajo de una hora, `1h05m` a partir de una hora
- AND sin el campo, o con un valor que no sea un número finito y positivo (`"x"`, `1e999`, `{}`), se muestra `0m`

**MODIFIED — Coste**
- GIVEN un JSON con `cost.total_cost_usd`
- WHEN se pinta la L2
- THEN se muestra `💰 $` y el coste con dos decimales
- AND sin el campo, o con un valor que no sea un número finito y positivo (un texto, `-1`), se muestra `$0.00`
- AND con `cost.total_duration_ms` de 5 minutos o más y coste mayor que 0, se añade ` · $` y el coste por hora con dos decimales seguido de `/h`: $0.47 en 12 minutos es `💰 $0.47 · $2.35/h`
- AND con menos de 5 minutos, sin duración numérica o con coste 0, no se muestra el coste por hora: $0.20 en 4 minutos es `💰 $0.20`

**MODIFIED — Ventana de 5h**
- GIVEN un JSON con `rate_limits.five_hour`
- WHEN se pinta la L2
- THEN se muestra el icono de nivel del porcentaje, `5h`, `⏳` y el tiempo transcurrido de la ventana, una barra de 8 bloques, el porcentaje y `↻` con la hora local de reset (`HH:MM`)
- AND el icono de nivel es 🟢 por debajo del 20 %, 🟡 por debajo del 70 %, 🔥 por debajo del 90 % y 🚨 a partir del 90 %: un 34 % pinta `🟡 5h`, un 95 % pinta `🚨 5h`
- AND el tiempo transcurrido es 5 h menos lo que falta para `resets_at`, acotado entre 0 y 5 h
- AND la barra lleva el marcador de ritmo en la celda del transcurrido sobre 5 h: con 1h23m transcurridas (27,7 %) y un 34 % gastado, la barra es `██┃█████`
- AND sin `resets_at`, o con un `resets_at` que no sea un epoch numérico o no dé una fecha válida (`1e308`), se muestran solo el icono, `5h`, la barra sin marcador y el porcentaje
- AND sin `rate_limits.five_hour` el segmento no aparece

**MODIFIED — Ventana semanal**
- GIVEN un JSON con `rate_limits.seven_day`
- WHEN se pinta la L2
- THEN se muestra el icono de nivel del porcentaje, `7d`, `⏳` y el tiempo transcurrido de la ventana, una barra de 8 bloques, el porcentaje y `↻` con el tiempo que queda hasta `resets_at`
- AND el icono de nivel sigue los mismos cortes que en la ventana de 5h: un 38 % pinta `🟡 7d`, un 10 % pinta `🟢 7d`, un 75 % pinta `🔥 7d`
- AND el tiempo transcurrido es 7 días menos lo que falta para `resets_at`, acotado entre 0 y 7 días
- AND el tiempo que queda es lo que falta para `resets_at`, acotado a 0 por abajo
- AND la barra lleva el marcador de ritmo en la celda del transcurrido sobre 7 días: con 6 días transcurridos (85,7 %) y un 38 % gastado, la barra es `██████┃█`; con el reset vencido, el marcador va en la última celda
- AND con un `resets_at` a más de 7 días, el transcurrido es 0 y el marcador va en la primera celda
- AND sin `resets_at`, o con un `resets_at` que no sea un epoch numérico o no dé una fecha válida (`1e308`), se muestran solo el icono, `7d`, la barra sin marcador y el porcentaje
- AND sin `rate_limits.seven_day` el segmento no aparece

### Capacidad: `session-state`

**MODIFIED — Velocity**
- GIVEN un JSON con `cost.total_lines_added` y `cost.total_lines_removed`
- WHEN al menos uno de los dos es mayor que cero
- THEN se muestra `+<añadidas> -<eliminadas>` como último segmento de la L1
- AND si los dos son cero o faltan, el segmento no aparece
- AND un valor que no sea un número finito y positivo cuenta como 0: `{}` añadidas y 2 eliminadas pintan `+0 -2`
- AND velocity sale del JSON de la sesión, no de `git`

## Adendas

- 2026-10-05 — Validado en el smoke de la release 1.1.0: «Validado: lo he probado y funciona» · no detalló qué probó — el dev-lead
