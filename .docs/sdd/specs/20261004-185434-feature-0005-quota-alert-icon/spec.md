---
id: 20261004-185434-feature-0005-quota-alert-icon
feature: 0005
title: Icono de alerta en las ventanas de cuota
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

# Spec — Icono de alerta en las ventanas de cuota

## Capacidades

- Modificadas: `usage` — «Ventana de 5h» y «Ventana semanal» pintan el icono de nivel; cambia la regla de **Avisos**.

## Decisiones que he tomado yo — valida estas

Review de spec propuesta: ninguna — señales: MODIFIED (dos requisitos y una regla de `usage`) · tamaño: ~15 líneas en 2 ficheros
- Mínimo razonable: ninguna — deja sin mirar por otro agente si los MODIFIED conservan las cláusulas vigentes; lo comprueba el repaso de coherencia

1. Modo full y no lite: lite necesita la confirmación del dev-lead y el perfil es `unattended`.
2. Mismos iconos y cortes que el contexto (🟢 por debajo del 20 %, 🟡 por debajo del 70 %, 🔥 por debajo del 90 %, 🚨 desde el 90 %): la regla 4 de la constitution pide un icono «como el que ya tiene el contexto», y el color del porcentaje ya usa esos cortes.
3. El icono va delante de la etiqueta de la ventana (`🟡 5h ⏳ …`), como en el contexto, donde va delante de la barra. Se pinta siempre, no solo desde el 70 %: así lo hace el contexto. Ensancha la L2 en dos emoji.
4. Al cerrar, la regla 4 de la constitution pasa este pendiente a vigente.

### Decisiones tomadas con el dev-lead

- Perfil `unattended` para la feature — «ok! dale unattended»

## Intent

El contexto avisa con un icono de color cuando se llena; las ventanas de 5h y semanal solo cambian el color del porcentaje, que se pierde entre las barras. Con el mismo icono, un 🔥 o un 🚨 en la cuota se ve igual de rápido que en el contexto.

## Scope

- Entra: `renderFiveHour` y `renderSevenDay` en `statusline.js`; tests; regla 4 de `constitution.md`.
- No entra: otros cortes o iconos, la barra del contexto, el marcador `⚠` (0006).

## Approach

El icono del contexto pasa a ser el icono de nivel de cualquier porcentaje, y las dos ventanas lo pintan delante de su etiqueta.

## Delta de comportamiento

### Capacidad: `usage`

**MODIFIED — Ventana de 5h**

- GIVEN un JSON con `rate_limits.five_hour`
- WHEN se pinta la L2
- THEN se muestra el icono de nivel del porcentaje, `5h`, `⏳` y el tiempo transcurrido de la ventana, una barra de 8 bloques, el porcentaje y `↻` con la hora local de reset (`HH:MM`)
- AND el icono de nivel es 🟢 por debajo del 20 %, 🟡 por debajo del 70 %, 🔥 por debajo del 90 % y 🚨 a partir del 90 %: un 34 % pinta `🟡 5h`, un 95 % pinta `🚨 5h`
- AND el tiempo transcurrido es 5 h menos lo que falta para `resets_at`, acotado entre 0 y 5 h
- AND la barra lleva el marcador de ritmo en la celda del transcurrido sobre 5 h: con 1h23m transcurridas (27,7 %) y un 34 % gastado, la barra es `██┃█████`
- AND sin `resets_at`, o con un `resets_at` que no sea un epoch numérico, se muestran solo el icono, `5h`, la barra sin marcador y el porcentaje
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
- AND sin `resets_at`, o con un `resets_at` que no sea un epoch numérico, se muestran solo el icono, `7d`, la barra sin marcador y el porcentaje
- AND sin `rate_limits.seven_day` el segmento no aparece

**Reglas de la capacidad**
- **Avisos**: solo visuales: el icono de nivel (contexto, ventana de 5h y semanal) y el color del porcentaje, con los mismos cortes. El `↻` de la ventana semanal es una cuenta atrás, no una hora local; el de la ventana de 5h sigue siendo la hora local.

## Enmiendas

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
| --- | --- | --- | --- |
| dev-lead | Claude (unattended) | 2026-10-04 | aprobada por el agente en `unattended` |
