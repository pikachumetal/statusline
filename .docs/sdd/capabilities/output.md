# Capacidad — output

Qué escribe el statusline en stdout y con qué aspecto. El contenido de cada
línea está en `session-state.md` (L1) y en `usage.md` (L2).

## Requisitos

### Dos líneas

> Cobertura: con test.

- GIVEN cualquier entrada
- WHEN el statusline termina
- THEN ha escrito en stdout exactamente dos líneas, L1 y L2, separadas por un salto de línea y sin salto final
- AND no escribe nada en stderr

### Separador de segmentos

> Cobertura: sin test.

- GIVEN una línea con varios segmentos
- WHEN se pinta
- THEN los segmentos van separados por `│` en gris, con un espacio a cada lado
- AND un segmento que no tiene nada que mostrar no deja separador ni hueco

Excepción conocida: con stdin inválido el segmento de ubicación queda vacío y sí
deja su separador (L1 empieza por ` │`). Está en la tabla de deuda de `roadmap.md`.

### Color

> Cobertura: parcial. Con test solo el gris de los bloques vacíos de una barra.

- GIVEN un terminal con truecolor
- WHEN se pinta el statusline
- THEN los colores se emiten como secuencias ANSI de 24 bits (`38;2;r;g;b`)
- AND cada fragmento coloreado termina con un reset, de modo que un color no se arrastra al segmento siguiente ni al prompt
- AND el repo va en naranja y negrita; el branch, en verde; el perfil y el modelo, en magenta; el effort, el sufijo de ahorro, las etiquetas `5h` y `7d`, la hora de reset y el coste, atenuados; velocity, en verde lo añadido y en rojo lo eliminado

El color del porcentaje y el gradiente de las barras están en `usage.md`.

### Iconos

> Cobertura: parcial. Con test la presencia de los iconos de L1 y L2 y la ausencia del icono de branch sin git.

- GIVEN un terminal con una nerd font
- WHEN se pinta el statusline
- THEN el icono de branch es el glifo U+E0A0 de la nerd font, y el resto de iconos son emojis
- AND sin nerd font el icono de branch se ve como un símbolo roto: es un requisito del terminal, no se degrada (ver `mission.md`)

## Reglas de la capacidad

- **Dónde viven los datos**: no aplica. Solo se escribe en stdout.
- **Idioma de los nombres**: el texto que se pinta va en inglés (`5h`, `7d`).
- **Límites**: dos líneas. Pasa a ser configurable con el módulo de configurabilidad (ver `roadmap.md`). No hay ancho máximo: una línea más larga que el terminal no se trunca.
- **Avisos**: no aplica.
- **Regla ante conflicto**: no aplica.

## Historial

- 2026-09-20 — release v1.0.0 — ADDED todos los requisitos. Capacidad detectada al revisar el volcado inicial antes de cerrar la release; describe la versión inicial.
