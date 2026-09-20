# Capacidad — usage

La segunda línea (L2): cuánto se ha consumido. Los segmentos van separados por
`│`, en este orden: reloj, contexto, ventana de 5h, ventana semanal, coste.

## Requisitos

### Reloj de sesión

> Cobertura: con test.

- GIVEN un JSON con `cost.total_duration_ms`
- WHEN se pinta la L2
- THEN se muestra `⏱️` y la duración redondeada al minuto: `12m` por debajo de una hora, `1h05m` a partir de una hora
- AND sin el campo se muestra `0m`

### Contexto

> Cobertura: con test.

- GIVEN un JSON con `context_window.used_percentage`
- WHEN se pinta la L2
- THEN se muestra un icono, una barra de 10 bloques y el porcentaje redondeado
- AND el icono es 🟢 por debajo del 20 %, 🟡 por debajo del 70 %, 🔥 por debajo del 90 % y 🚨 a partir del 90 %
- AND sin el campo se muestra 🟢 y 0 %

### Ventana de 5h

> Cobertura: con test, salvo la ausencia de `resets_at`.

- GIVEN un JSON con `rate_limits.five_hour`
- WHEN se pinta la L2
- THEN se muestra `5h`, `⏳` y el tiempo transcurrido de la ventana, una barra de 8 bloques, el porcentaje y `↻` con la hora local de reset (`HH:MM`)
- AND el tiempo transcurrido es 5 h menos lo que falta para `resets_at`, acotado entre 0 y 5 h
- AND sin `resets_at` se muestran solo `5h`, la barra y el porcentaje
- AND sin `rate_limits.five_hour` el segmento no aparece

### Ventana semanal

> Cobertura: con test.

- GIVEN un JSON con `rate_limits.seven_day`
- WHEN se pinta la L2
- THEN se muestra `7d`, una barra de 8 bloques y el porcentaje
- AND no se muestra la hora de reset
- AND sin `rate_limits.seven_day` el segmento no aparece

### Coste

> Cobertura: con test.

- GIVEN un JSON con `cost.total_cost_usd`
- WHEN se pinta la L2
- THEN se muestra `💰 $` y el coste con dos decimales
- AND sin el campo se muestra `$0.00`

### Barras

> Cobertura: con test.

- GIVEN un porcentaje y un ancho en bloques
- WHEN se pinta una barra
- THEN la barra tiene siempre ese número de bloques `█`
- AND el número de bloques rellenos es el porcentaje llevado al ancho y redondeado al bloque más cercano (un 47 % en 10 bloques rellena 5)
- AND los bloques rellenos toman su color de su posición en la barra (verde, amarillo, rojo), no del valor
- AND los bloques vacíos son grises
- AND un porcentaje fuera de rango o no numérico se acota entre 0 y 100

### Color del porcentaje

> Cobertura: sin test.

- GIVEN el porcentaje del contexto, de la ventana de 5h o de la semanal
- WHEN se pinta
- THEN su color depende del valor: verde por debajo del 20 %, amarillo por debajo del 70 %, ámbar por debajo del 90 % y rojo a partir del 90 %

## Reglas de la capacidad

- **Dónde viven los datos**: no aplica. Todo llega en el JSON del stdin.
- **Idioma de los nombres**: las etiquetas que se pintan (`5h`, `7d`) van en inglés.
- **Límites**: barra del contexto de 10 bloques; barras de cuota de 8 bloques; porcentajes acotados entre 0 y 100.
- **Avisos**: solo visuales: el icono del contexto y el color del porcentaje. Las ventanas de 5h y semanal no tienen icono de alerta (pendiente en `roadmap.md`).
- **Regla ante conflicto**: no aplica. Cada dato tiene una sola fuente.

## Historial

- 2026-09-20 — init — ADDED todos los requisitos. Volcado inicial desde el código, a petición del usuario (excepción a la regla anti-proliferación 4).
