---
id: 20261004-141040-feature-0010-sub-block-bars
feature: 0010
title: Barras con sub-bloques
mode: full
profile: unattended
status: done
created: 2026-10-04
author: Claude (unattended)
approvers:
  - role: dev-lead
    name: Àngel Delgado
    approved_at: null
---

# Spec — Barras con sub-bloques

## Capacidades

- Modificadas: `usage` — cambia «Barras»: la celda de corte pinta un sub-bloque de octavos.

## Decisiones que he tomado yo — valida estas

Review de spec propuesta: ninguna — señales: MODIFIED (requisito «Barras» de `usage`) · tamaño: ~15 líneas en 2 ficheros
- Mínimo razonable: ninguna — deja sin mirar por otro agente si el MODIFIED de «Barras» conserva el resto de cláusulas; lo comprueba el repaso de coherencia

1. Modo full y no lite. El predicado lite se cumple, pero lite necesita la confirmación del dev-lead y el perfil es `unattended`: va la opción conservadora.
2. La celda de corte pinta el sub-bloque con el color de su posición en el gradiente, sobre fondo gris (el mismo gris de los bloques vacíos). Así la barra se lee continua. Descartado: el sub-bloque sobre el fondo de la terminal, que deja un hueco negro dentro de la barra, y los medios bloques, que dan la mitad de resolución.
3. Redondeo al octavo más cercano: `round(pct / 100 × ancho × 8)` octavos. Un resto 0 no pinta celda parcial.
4. Los sub-bloques son los de *Block Elements* de Unicode (`▏▎▍▌▋▊▉`), que no dependen de la nerd font.

### Decisiones tomadas con el dev-lead

- Perfil `unattended` para la feature — «arrancala en unattended»

## Intent

Las barras de 8 bloques cambian de bloque cada 12,5 %: un 34 % y un 38 % se pintan igual. Con sub-bloques de octavos, la barra tiene 8 veces más resolución con el mismo ancho, y un cambio de pocos puntos se ve.

## Scope

- Entra: `bar()` en `statusline.js`, para las tres barras (contexto, 5h y semanal); sus tests en `statusline.test.js`.
- No entra: el ancho de las barras, el gradiente, el color del porcentaje, el marcador de ritmo (0011).

## Approach

La barra se calcula en octavos. Las celdas llenas y vacías siguen igual. La celda de corte pinta el carácter de octavos que corresponde al resto, con el color de su posición y fondo gris.

## Delta de comportamiento

### Capacidad: `usage`

**MODIFIED — Barras** (antes: "la barra tiene siempre ese número de bloques `█`" y "redondeado al bloque más cercano")

- GIVEN un porcentaje y un ancho en celdas
- WHEN se pinta una barra
- THEN la barra tiene siempre ese número de celdas
- AND lo relleno es el porcentaje llevado a octavos de celda y redondeado al octavo más cercano: las celdas enteras se pintan con `█` y la celda de corte, si sobra un resto, con el sub-bloque de ese resto (`▏▎▍▌▋▊▉`, de 1 a 7 octavos)
- AND un 47 % en 10 celdas pinta 4 `█`, un `▊` y 5 celdas vacías; un 34 % en 8 celdas pinta 2 `█`, un `▊` y 5 vacías; un 38 % en 8 celdas pinta 3 `█` y 5 vacías
- AND las celdas llenas y el sub-bloque toman su color de su posición en la barra (verde, amarillo, rojo), no del valor
- AND el sub-bloque se pinta sobre fondo gris, y las celdas vacías son `█` grises
- AND un porcentaje fuera de rango o no numérico se acota entre 0 y 100

## Enmiendas

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
| --- | --- | --- | --- |
| dev-lead | Claude (unattended) | 2026-10-04 | aprobada por el agente en `unattended` |
