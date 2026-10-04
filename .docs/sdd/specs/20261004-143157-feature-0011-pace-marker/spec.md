---
id: 20261004-143157-feature-0011-pace-marker
feature: 0011
title: Marcador de ritmo en las barras de cuota
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

# Spec — Marcador de ritmo en las barras de cuota

## Capacidades

- Modificadas: `usage` — «Ventana de 5h» y «Ventana semanal» pintan el marcador de ritmo; «Barras» admite la celda del marcador.

## Decisiones que he tomado yo — valida estas

Review de spec propuesta: ninguna — señales: MODIFIED (tres requisitos de `usage`) · tamaño: ~40 líneas en 2 ficheros
- Mínimo razonable: ninguna — deja sin mirar por otro agente si los tres MODIFIED conservan las cláusulas vigentes; lo comprueba el repaso de coherencia

1. Modo full y no lite: lite necesita la confirmación del dev-lead y el perfil es `unattended`.
2. El ritmo es el tiempo transcurrido de la ventana sobre su duración, en porcentaje: lo que llevarías gastado si gastaras uniforme hasta el reset.
3. El marcador ocupa la celda `min(ancho − 1, ⌊ritmo / 100 × ancho⌋)` y pinta `┃` blanco (`240;240;240`) sobre un fondo del color que tendría esa celda: el del gradiente si está llena entera y gris si no. El relleno se sigue leyendo por el fondo. Descartados: solo texto tras el porcentaje (no está en la barra) y subrayado (soporte desigual entre terminales).
4. Si el marcador cae en la celda de corte, sustituye al sub-bloque: esa celda pierde el octavo. Con 8 celdas, la precisión del marcador (12,5 %) ya es menor que la del sub-bloque.
5. Sin `resets_at` válido no hay marcador. La barra del contexto no tiene marcador: no tiene ventana.
6. Repaso de coherencia: el ejemplo del 80 % con ritmo decía `██┃█████`; con 6 celdas llenas y un resto de 3 octavos es `██┃███▍█`. Corregido.
7. Entra la deuda de los Minor de la 0010 (tests de los 7 restos y del color del sub-bloque): toca `bar` y sus tests, como esta feature.

### Decisiones tomadas con el dev-lead

- Perfil `unattended` para la feature — «LANZA EL SIGUIENTE UNATTENDED»

## Intent

Las barras de 5h y semanal dicen cuánto se ha gastado, pero no si va rápido o despacio. Con una marca de dónde estarías gastando uniforme hasta el reset, se ve de un vistazo si la cuota va a acabarse antes de tiempo: la barra que pasa de la marca va por delante.

## Scope

- Entra: `bar()`, `renderFiveHour()` y `renderSevenDay()` en `statusline.js`; tests en `statusline.test.js`, incluidos los de los 7 restos y el color del sub-bloque (deuda de la 0010).
- No entra: la barra del contexto, el icono de alerta (0005), texto del ritmo tras el porcentaje.

## Approach

`bar` recibe el ritmo como tercer parámetro opcional. Las ventanas lo calculan con el transcurrido que ya calculan para el `⏳`. Sin ritmo, `bar` pinta como hoy.

## Delta de comportamiento

### Capacidad: `usage`

**MODIFIED — Ventana de 5h**

- GIVEN un JSON con `rate_limits.five_hour`
- WHEN se pinta la L2
- THEN se muestra `5h`, `⏳` y el tiempo transcurrido de la ventana, una barra de 8 bloques, el porcentaje y `↻` con la hora local de reset (`HH:MM`)
- AND el tiempo transcurrido es 5 h menos lo que falta para `resets_at`, acotado entre 0 y 5 h
- AND la barra lleva el marcador de ritmo en la celda del transcurrido sobre 5 h: con 1h23m transcurridas (27,7 %) y un 34 % gastado, la barra es `██┃█████`
- AND sin `resets_at`, o con un `resets_at` que no sea un epoch numérico, se muestran solo `5h`, la barra sin marcador y el porcentaje
- AND sin `rate_limits.five_hour` el segmento no aparece

**MODIFIED — Ventana semanal**

- GIVEN un JSON con `rate_limits.seven_day`
- WHEN se pinta la L2
- THEN se muestra `7d`, `⏳` y el tiempo transcurrido de la ventana, una barra de 8 bloques, el porcentaje y `↻` con el tiempo que queda hasta `resets_at`
- AND el tiempo transcurrido es 7 días menos lo que falta para `resets_at`, acotado entre 0 y 7 días
- AND el tiempo que queda es lo que falta para `resets_at`, acotado a 0 por abajo
- AND la barra lleva el marcador de ritmo en la celda del transcurrido sobre 7 días: con 6 días transcurridos (85,7 %) y un 38 % gastado, la barra es `██████┃█`; con el reset vencido, el marcador va en la última celda
- AND sin `resets_at`, o con un `resets_at` que no sea un epoch numérico, se muestran solo `7d`, la barra sin marcador y el porcentaje
- AND sin `rate_limits.seven_day` el segmento no aparece

**MODIFIED — Barras**

- GIVEN un porcentaje, un ancho en celdas y, opcional, un ritmo en porcentaje
- WHEN se pinta una barra
- THEN la barra tiene siempre ese número de celdas
- AND lo relleno es el porcentaje llevado a octavos de celda y redondeado al octavo más cercano: las celdas enteras se pintan con `█` y la celda de corte, si sobra un resto, con el sub-bloque de ese resto (`▏▎▍▌▋▊▉`, de 1 a 7 octavos)
- AND un 47 % en 10 celdas pinta 4 `█`, un `▊` y 5 celdas vacías; un 34 % en 8 celdas pinta 2 `█`, un `▊` y 5 vacías; un 38 % en 8 celdas pinta 3 `█` y 5 vacías
- AND las celdas llenas y el sub-bloque toman su color de su posición en la barra (verde, amarillo, rojo), no del valor
- AND el sub-bloque se pinta sobre fondo gris, y las celdas vacías son `█` grises
- AND con ritmo, la celda `min(ancho − 1, ⌊ritmo / 100 × ancho⌋)` pinta `┃` blanco sobre el color del gradiente de esa celda si está llena entera, y sobre gris si no; un 80 % en 8 celdas con ritmo 27,7 % es `██┃███▍█` con el `┃` sobre el color de la celda 2
- AND un porcentaje o un ritmo fuera de rango o no numérico se acota entre 0 y 100

## Enmiendas

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
| --- | --- | --- | --- |
| dev-lead | Claude (unattended) | 2026-10-04 | aprobada por el agente en `unattended` |
