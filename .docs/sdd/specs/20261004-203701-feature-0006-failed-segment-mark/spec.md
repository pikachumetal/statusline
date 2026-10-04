---
id: 20261004-203701-feature-0006-failed-segment-mark
feature: 0006
title: Marcador ⚠ cuando un segmento falla
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

# Spec — Marcador ⚠ cuando un segmento falla

## Capacidades

- Modificadas: `input` — «Stdin vacío o inválido» cubre un JSON que no es un objeto.
- Modificadas: `output` — nuevo requisito «Segmento que falla».

## Decisiones que he tomado yo — valida estas

Review de spec propuesta: ninguna — señales: MODIFIED («Stdin vacío o inválido» de `input`) · tamaño: ~30 líneas en 2 ficheros y 2 docs
- Mínimo razonable: ninguna — deja sin mirar por otro agente qué entradas pueden hacer fallar un segmento; lo cubre el Review Focus del plan

1. Modo full y no lite: lite necesita la confirmación del dev-lead y el perfil es `unattended`.
2. «Falla» es que el segmento lanza un error al pintarse. Que falte un dato (sin `git`, sin `rate_limits`, sin `model`) **no** es un fallo: el segmento se sigue omitiendo o usa su valor por defecto («Campo ausente en el JSON»). Con `⚠` por falta de dato, quien usa la API sin cuota de suscripción vería `⚠` en cada refresco.
3. El marcador es `⚠` en gris, en el sitio del segmento, con su separador: `⚠ │ 🤖 ? │ …`.
4. Hoy un segmento que lanza un error tira el statusline entero (sin salida), contra el principio 3. Medido: `{"workspace":{"project_dir":123}}` rompe en `path.basename(123)`, y un stdin `null` rompe en `data.workspace`. Las dos entradas pasan a pintar.
5. Un stdin con JSON válido que no es un objeto (`null`, `3`, `"x"`, `[]`) se trata como `{}`.
6. Al cerrar, la regla 4 de la constitution pasa el `⚠` a vigente y separa «falta un dato» (se omite) de «falla» (`⚠`).

### Decisiones tomadas con el dev-lead

- Perfil `unattended` para la feature — «ok! dale unattended»

## Intent

Hoy un segmento que falla al pintarse no se omite: tira el statusline entero y Claude Code no pinta nada. Se quiere que cada segmento falle por separado y que el fallo se vea con un `⚠` discreto, sin perder el resto.

## Scope

- Entra: `renderLine1`, `renderLine2` y `main` en `statusline.js`; tests; regla 4 de `constitution.md` y `architecture.md`.
- No entra: avisar de datos ausentes, mensajes de error, logs (el statusline no escribe ficheros, regla 1).

## Approach

Cada segmento se pinta dentro de una guarda que devuelve `⚠` si lanza un error. `main` normaliza el stdin a un objeto.

## Delta de comportamiento

### Capacidad: `input`

**MODIFIED — Stdin vacío o inválido**

- GIVEN un stdin vacío, que no es JSON válido, o un JSON que no es un objeto (`null`, `3`, `"x"`, `[]`)
- WHEN Claude Code ejecuta el statusline
- THEN el statusline pinta sus dos líneas con valores por defecto (modelo `?`, contexto 🟢 0 %, reloj `0m`, coste `$0.00`) y termina sin error

### Capacidad: `output`

**ADDED — Segmento que falla**

- GIVEN un segmento que lanza un error al pintarse
- WHEN se pinta su línea
- THEN en su lugar se pinta `⚠` en gris, con su separador, y el resto de segmentos se pinta igual
- AND con `{"workspace":{"project_dir":123}}` la L1 es `⚠ │ 🤖 ? │ …` y la L2 se pinta entera
- AND un segmento sin datos no es un fallo: se omite o usa su valor por defecto, sin `⚠`

## Enmiendas

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
| --- | --- | --- | --- |
| dev-lead | Claude (unattended) | 2026-10-04 | aprobada por el agente en `unattended` |
