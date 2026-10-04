# Capacidad — usage

## Propósito

La segunda línea (L2): cuánto se ha consumido. Los segmentos van separados por `│`, en este orden: reloj, contexto, ventana de 5h, ventana semanal, coste.

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

> Cobertura: con test.

- GIVEN un JSON con `rate_limits.five_hour`
- WHEN se pinta la L2
- THEN se muestra `5h`, `⏳` y el tiempo transcurrido de la ventana, una barra de 8 bloques, el porcentaje y `↻` con la hora local de reset (`HH:MM`)
- AND el tiempo transcurrido es 5 h menos lo que falta para `resets_at`, acotado entre 0 y 5 h
- AND sin `resets_at`, o con un `resets_at` que no sea un epoch numérico, se muestran solo `5h`, la barra y el porcentaje
- AND sin `rate_limits.five_hour` el segmento no aparece

### Ventana semanal

> Cobertura: con test.

- GIVEN un JSON con `rate_limits.seven_day`
- WHEN se pinta la L2
- THEN se muestra `7d`, `⏳` y el tiempo transcurrido de la ventana, una barra de 8 bloques, el porcentaje y `↻` con el tiempo que queda hasta `resets_at`
- AND el tiempo transcurrido es 7 días menos lo que falta para `resets_at`, acotado entre 0 y 7 días
- AND el tiempo que queda es lo que falta para `resets_at`, acotado a 0 por abajo
- AND sin `resets_at`, o con un `resets_at` que no sea un epoch numérico, se muestran solo `7d`, la barra y el porcentaje
- AND sin `rate_limits.seven_day` el segmento no aparece

### Formato de duración larga

> Cobertura: con test.

- GIVEN una duración en milisegundos
- WHEN se pinta el `⏳` o el `↻` de la ventana semanal
- THEN a partir de 24 h se muestra en días y horas (`4d12h`), con las horas redondeadas hacia abajo
- AND por debajo de 24 h se muestra en el formato corto ya existente (`4h16m` o `16m`)

### Coste

> Cobertura: con test.

- GIVEN un JSON con `cost.total_cost_usd`
- WHEN se pinta la L2
- THEN se muestra `💰 $` y el coste con dos decimales
- AND sin el campo se muestra `$0.00`

### Barras

- GIVEN un porcentaje y un ancho en celdas
- WHEN se pinta una barra
- THEN la barra tiene siempre ese número de celdas
- AND lo relleno es el porcentaje llevado a octavos de celda y redondeado al octavo más cercano: las celdas enteras se pintan con `█` y la celda de corte, si sobra un resto, con el sub-bloque de ese resto (`▏▎▍▌▋▊▉`, de 1 a 7 octavos)
- AND un 47 % en 10 celdas pinta 4 `█`, un `▊` y 5 celdas vacías; un 34 % en 8 celdas pinta 2 `█`, un `▊` y 5 vacías; un 38 % en 8 celdas pinta 3 `█` y 5 vacías
- AND las celdas llenas y el sub-bloque toman su color de su posición en la barra (verde, amarillo, rojo), no del valor
- AND el sub-bloque se pinta sobre fondo gris, y las celdas vacías son `█` grises
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
- **Avisos**: solo visuales: el icono del contexto y el color del porcentaje. Las ventanas de 5h y semanal no tienen icono de alerta (pendiente en `roadmap.md`). El `↻` de la ventana semanal es una cuenta atrás, no una hora local; el de la ventana de 5h sigue siendo la hora local.
- **Regla ante conflicto**: no aplica. Cada dato tiene una sola fuente.
