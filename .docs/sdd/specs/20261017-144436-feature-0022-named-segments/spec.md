---
id: 20261017-144436-feature-0022-named-segments
feature: 0022
proposal: 0021
title: Segmentos con nombre y render guiado por un layout
mode: lite
profile: delegate
status: approved
created: 2026-10-17
author: Claude (Opus 5.5)
approvers:
  - role: dev-lead
    name: Àngel Delgado
    approved_at: 2026-10-17
---

# Spec — Segmentos con nombre y render guiado por un layout

> **Estado**: approved.
> **Siguiente paso**: modo lite → implementación directa, tras aprobar esta spec.

## Capacidades

- Ninguna, porque refactor: sin `statusline.json` (0023) nadie puede pasar un layout, y la salida no cambia. El layout configurable entra en `output` con la 0023.

## Decisiones que he tomado yo — valida estas

1. El layout es una lista de líneas y cada línea una lista de nombres: `env.layout: string[][]`. Por defecto, `[['profile', 'where', 'model', 'caveman', 'ponytail', 'velocity'], ['duration', 'context', 'five_hour', 'seven_day', 'cost']]`, el de la v1.2.0. — Es la forma de `lines` de la propuesta 0021: la 0023 solo tendrá que leerla.
2. Los nombres son los de la propuesta: `profile`, `where`, `model`, `caveman`, `ponytail`, `velocity`, `duration`, `context`, `five_hour`, `seven_day`, `cost`. Distinguen mayúsculas.
3. Todos los segmentos pasan por `segment()`, también `profile`, que hoy no lo hace. — Con un layout, cualquier segmento puede ir en cualquier línea, y la regla «un segmento que lanza deja `⚠`» tiene que valer para todos. Sin efecto visible: el perfil no puede lanzar.
4. Un nombre desconocido pinta `⚠` gris en su sitio (el `FAILED` de hoy). — Lo decidiste para esta feature: `render` es quien busca el nombre.
5. Una línea sin nada que pintar se omite; un segmento repetido se pinta las dos veces. — Reglas de la propuesta 0021.
6. Las líneas se unen con `\n` y los segmentos de una línea con el separador de hoy (` │ `). Sin líneas que pintar, `render` devuelve `''`.
7. `render(data, env, now)` mantiene la firma; `env.layout` es opcional y, ausente, vale el de la v1.2.0. `renderLine1` y `renderLine2` desaparecen: los sustituye un registro de segmentos por nombre.

### Decisiones tomadas con el dev-lead

- Modo lite, perfil `delegate`. — «Lite, delegate (Recomendada)»
- El nombre desconocido pinta `⚠` ya en esta feature. — «En la 0022 (Recomendada)»
- Spec aprobada el 2026-10-17. — «si»

## Intent

La propuesta 0021 quiere que la status line se pueda configurar: qué segmentos, en qué orden y en cuántas líneas. Hoy `renderLine1` y `renderLine2` fijan los 11 segmentos en su sitio. Esta feature les da nombre y hace que `render` pinte el layout que recibe, sin cambiar nada de lo que se ve; la 0023 leerá el layout de `statusline.json`.

## Scope

- Entra: `statusline.js` (`renderLine1`, `renderLine2` y `render` pasan a un registro de segmentos por nombre y un `render` guiado por `env.layout`), `statusline.test.js` (tests del layout).
- No entra: leer `statusline.json`, validar su forma ni el `⚠` de configuración inválida al final de la L1 (0023); cambiar el README.

## Approach

Un registro con un pintor por nombre, cada uno con lo que hoy pinta su trozo de `renderLine1` o `renderLine2`, y un `render` que recorre `env.layout`, pinta cada nombre dentro de `segment()` y descarta los `null` como hoy.

### Criterios de aceptación

- GIVEN el stdin y el entorno de cualquier test actual de `statusline.test.js` · WHEN se pinta sin `env.layout` · THEN la salida es la de hoy (la suite actual sigue en verde sin tocar sus asserts).
- GIVEN un stdin con modelo `Opus` y coste 0.42 USD · WHEN se pinta con `env.layout` = el de la v1.2.0 · THEN la salida es idéntica byte a byte a la de sin `env.layout`.
- GIVEN `env.layout` = `[['cost', 'model']]` · WHEN se pinta · THEN sale una sola línea con el coste, ` │ ` y el modelo, en ese orden.
- GIVEN `env.layout` = `[['where', 'modle', 'cost']]` · WHEN se pinta · THEN el sitio de `modle` lleva un `⚠` gris y la ubicación y el coste se pintan igual.
- GIVEN `env.layout` = `[['caveman'], ['cost']]` y sin `.caveman-active` · WHEN se pinta · THEN solo sale la línea del coste.
- GIVEN `env.layout` = `[['cost', 'cost']]` · WHEN se pinta · THEN sale `💰 … │ 💰 …`.

### Estimación y esfuerzo

- Tipo: backend
- Esfuerzo spec: 0.3h
- Estimación de implementación: 1h
- Base de la estimación: un fichero, refactor de dos funciones a un registro y 5 tests; la suite actual protege la salida. Backend en el log: mediana 1.
- Confianza: alta

## Enmiendas

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
| --- | --- | --- | --- |
| dev-lead | Àngel Delgado | 2026-10-17 | aprobada: «si» |
