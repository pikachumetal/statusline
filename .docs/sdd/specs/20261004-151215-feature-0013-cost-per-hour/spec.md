---
id: 20261004-151215-feature-0013-cost-per-hour
feature: 0013
title: Coste por hora
mode: full
profile: unattended
status: approved
created: 2026-10-04
author: Claude (unattended)
approvers:
  - role: dev-lead
    name: Àngel Delgado
    approved_at: null
---

# Spec — Coste por hora

## Capacidades

- Modificadas: `usage` — «Coste» añade el coste por hora y valida el campo; «Ventana semanal» acota el transcurrido en la variable (deuda de la 0011).

## Decisiones que he tomado yo — valida estas

Review de spec propuesta: ninguna — señales: MODIFIED (dos requisitos de `usage`) · tamaño: ~30 líneas en 2 ficheros
- Mínimo razonable: ninguna — deja sin mirar por otro agente si los MODIFIED conservan las cláusulas vigentes; lo comprueba el repaso de coherencia

1. Modo full y no lite: lite necesita la confirmación del dev-lead y el perfil es `unattended`.
2. El coste por hora es `total_cost_usd / (total_duration_ms / 3 600 000)`, con dos decimales, tras el coste y separado por ` · `: `💰 $0.47 · $2.35/h`.
3. Solo se pinta a partir de 5 minutos de sesión. Con menos, el ritmo se dispara con la primera respuesta (un $0.20 en 30 s son $24/h) y no informa.
4. Sin `total_duration_ms` numérico, o con coste 0, no se pinta.
5. `total_cost_usd` se valida con `Number.isFinite`. Hoy un valor no numérico (un texto) hace fallar `toFixed` y el statusline no pinta: contradice el principio 3 de la constitution. Ahora pinta `$0.00`.
6. Entra la deuda de la 0011: asserts de render del marcador (reset vencido semanal, `resets_at` no numérico, contexto sin `┃`), `Math.max(0, …)` en el transcurrido semanal y `GRAY_BG` en lugar de la constante duplicada del test.

### Decisiones tomadas con el dev-lead

- Perfil `unattended` para la feature — «PUES LA SIGUIENTE IGUAL»

## Intent

El coste de la sesión dice cuánto se lleva gastado, pero no a qué ritmo. Con `$/h` al lado se compara una sesión con otra y se ve si una tarea está saliendo cara.

## Scope

- Entra: el segmento de coste de `renderLine2` y `renderSevenDay` en `statusline.js`; tests en `statusline.test.js`, con la deuda de la 0011.
- No entra: coste por día o por bloque (necesita estado, regla 1), avisos de coste.

## Approach

El segmento de coste calcula el ritmo con los dos campos del JSON y lo añade solo si hay duración suficiente. El coste se valida antes de formatear.

## Delta de comportamiento

### Capacidad: `usage`

**MODIFIED — Coste**

- GIVEN un JSON con `cost.total_cost_usd`
- WHEN se pinta la L2
- THEN se muestra `💰 $` y el coste con dos decimales
- AND sin el campo, o con un valor que no sea un número finito, se muestra `$0.00`
- AND con `cost.total_duration_ms` de 5 minutos o más y coste mayor que 0, se añade ` · $` y el coste por hora con dos decimales seguido de `/h`: $0.47 en 12 minutos es `💰 $0.47 · $2.35/h`
- AND con menos de 5 minutos, sin duración numérica o con coste 0, no se muestra el coste por hora: $0.20 en 4 minutos es `💰 $0.20`

**MODIFIED — Ventana semanal**

- GIVEN un JSON con `rate_limits.seven_day`
- WHEN se pinta la L2
- THEN se muestra `7d`, `⏳` y el tiempo transcurrido de la ventana, una barra de 8 bloques, el porcentaje y `↻` con el tiempo que queda hasta `resets_at`
- AND el tiempo transcurrido es 7 días menos lo que falta para `resets_at`, acotado entre 0 y 7 días
- AND el tiempo que queda es lo que falta para `resets_at`, acotado a 0 por abajo
- AND la barra lleva el marcador de ritmo en la celda del transcurrido sobre 7 días: con 6 días transcurridos (85,7 %) y un 38 % gastado, la barra es `██████┃█`; con el reset vencido, el marcador va en la última celda
- AND con un `resets_at` a más de 7 días, el transcurrido es 0 y el marcador va en la primera celda
- AND sin `resets_at`, o con un `resets_at` que no sea un epoch numérico, se muestran solo `7d`, la barra sin marcador y el porcentaje
- AND sin `rate_limits.seven_day` el segmento no aparece

## Enmiendas

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
| --- | --- | --- | --- |
| dev-lead | Claude (unattended) | 2026-10-04 | aprobada por el agente en `unattended` |
