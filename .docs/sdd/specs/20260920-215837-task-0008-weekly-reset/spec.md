---
id: 20260920-215837-task-0008-weekly-reset
task: 0008
title: Tiempo transcurrido y cuenta atrás de reset en la ventana semanal
mode: lite
status: implementing
created: 2026-09-20
author: Àngel Delgado
approvers:
  - role: dev-lead
    name: Àngel Delgado
    approved_at: 2026-09-21
---

# Spec — Tiempo transcurrido y cuenta atrás de reset en la ventana semanal

## Decisiones que he tomado yo — valida estas

1. **Modo lite** — se cumplen las cinco condiciones del predicado: el flujo existe
   y se lee (`renderLine2` en `statusline.js`), no hay contrato público que cambie
   (los exports siguen siendo `render` y `bar`), no hay datos ni migración, cabe en
   un solo fichero, y la estimación es de 1 h (muy por debajo de media jornada).
2. **El `↻` del semanal es una cuenta atrás (`↻2d11h`), no una hora local** — la
   hora sola (`↻09:00`) no dice de qué día es cuando faltan varios días. El `↻` de
   la ventana de 5h no cambia: sigue siendo la hora local (`↻00:00`).
3. **Formato de días nuevo, sin tocar `fmtDuration`** — la duración con días
   (`4d12h`) vive en un helper propio. `fmtDuration` se queda como está, así que el
   reloj de sesión y el `⏳` de la ventana de 5h no cambian de aspecto.
4. **El % de Fable en el semanal queda fuera** — verificado en el binario de
   Claude Code `2.1.278`: el payload del statusline proyecta solo `five_hour`,
   `seven_day` y `spend_limit`. Los buckets por modelo (`seven_day_opus`,
   `seven_day_sonnet`, `model_scoped` con `display_name: 'Fable'`) existen en el
   esquema del SDK y de los hooks, pero no llegan al stdin del statusline, y el
   store (`rawUtilization`) vive solo en memoria del proceso de Claude Code. Sin
   fuente y sin fichero que leer, no hay segmento posible sin romper la regla 1 de
   la constitution. Se anota en el roadmap como bloqueado por el payload.
5. **Sin `resets_at` el segmento degrada como el de 5h** — se pintan solo `7d`, la
   barra y el porcentaje. Es el mismo criterio que ya sigue la ventana de 5h.

## Intent

Hoy la ventana semanal pinta solo `7d`, la barra y el porcentaje: dice cuánto se ha
gastado, pero no cuánto queda de ventana. La de 5h sí lo dice (`⏳` transcurrido y
`↻` hora de reset), y esa información es la que permite decidir si conviene esperar
al reset. La semanal ya recibe `resets_at` en el JSON; solo no lo usa.

## Scope

- Entra: `⏳` con el tiempo transcurrido de la ventana semanal, y `↻` con el tiempo
  que queda hasta el reset, ambos en formato días+horas.
- Entra: helper de formato de duración con días.
- No entra: el % de uso de Fable (sin fuente de datos, ver decisión 4).
- No entra: cualquier cambio en la ventana de 5h, en el reloj de sesión o en el
  icono de alerta de las cuotas (task 0005, aparte).

## Approach

`renderSevenDay` pasa a ser una función de segmento propia, simétrica a
`renderFiveHour`: calcula el transcurrido como la ventana de 7 días menos lo que
falta para `resets_at`, acotado a la ventana, y el restante como lo que falta para
`resets_at`, acotado a cero por abajo. Ambos se pintan con un formato que usa días
cuando la duración llega a 24 h y cae en el formato actual (`4h16m`) cuando no.
`render` sigue siendo pura: `now` ya llega como parámetro.

## Delta de comportamiento

### Capacidad: `usage`

**MODIFIED — Ventana semanal** (antes: "THEN se muestra `7d`, una barra de 8 bloques y el porcentaje / AND no se muestra la hora de reset")
- GIVEN un JSON con `rate_limits.seven_day`
- WHEN se pinta la L2
- THEN se muestra `7d`, `⏳` y el tiempo transcurrido de la ventana, una barra de 8 bloques, el porcentaje y `↻` con el tiempo que queda hasta `resets_at`
- AND el tiempo transcurrido es 7 días menos lo que falta para `resets_at`, acotado entre 0 y 7 días
- AND el tiempo que queda es lo que falta para `resets_at`, acotado a 0 por abajo
- AND sin `resets_at` se muestran solo `7d`, la barra y el porcentaje
- AND sin `rate_limits.seven_day` el segmento no aparece

**ADDED — Formato de duración larga**
- GIVEN una duración en milisegundos
- WHEN se pinta el `⏳` o el `↻` de la ventana semanal
- THEN a partir de 24 h se muestra en días y horas (`4d12h`), con las horas redondeadas hacia abajo
- AND por debajo de 24 h se muestra en el formato corto ya existente (`4h16m` o `16m`)

**Reglas de la capacidad**
- **Avisos**: el `↻` de la ventana semanal es una cuenta atrás, no una hora local; el de la ventana de 5h sigue siendo la hora local.

### Estimación y esfuerzo

- Tipo: infra/tooling
- Esfuerzo spec: 0.4h
- Estimación de implementación: 1h
- Base de la estimación: un solo fichero, un segmento ya existente y una función de
  formato nueva; los tests son de `render`, que es pura y no necesita mocks. Sin
  muestras de tasks en el `estimation-log` todavía (solo dos patches), así que la
  cifra es de referencia propia, no calibrada.
- Confianza: alta

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
| --- | --- | --- | --- |
| dev-lead | Àngel Delgado | 2026-09-21 | aprobada |
