# Capacidad — output

## Propósito

Qué escribe el statusline en stdout y con qué aspecto. El contenido de cada línea está en `session-state.md` (L1) y en `usage.md` (L2).

## Requisitos

### Separador de segmentos

- GIVEN una línea con varios segmentos
- WHEN se pinta
- THEN los segmentos van separados por `│` en gris, con un espacio a cada lado
- AND un segmento que no tiene nada que mostrar no deja separador ni hueco

### Color

> Cobertura: con test.

- GIVEN un terminal con truecolor
- WHEN se pinta el statusline
- THEN los colores se emiten como secuencias ANSI de 24 bits (`38;2;r;g;b`)
- AND cada fragmento coloreado termina con un reset, de modo que un color no se arrastra al segmento siguiente ni al prompt
- AND el repo va en naranja y negrita; el branch, en verde; el perfil y el modelo, en magenta; el effort, el sufijo de ahorro, las etiquetas `5h` y `7d`, la hora de reset y el coste, atenuados; velocity, en verde lo añadido y en rojo lo eliminado

El color del porcentaje y el gradiente de las barras están en `usage.md`.

### Iconos

> Cobertura: con test del glifo de branch y de los emojis; el símbolo roto sin nerd font es del terminal.

- GIVEN un terminal con una nerd font
- WHEN se pinta el statusline
- THEN el icono de branch es el glifo U+E0A0 de la nerd font, y el resto de iconos son emojis
- AND sin nerd font el icono de branch se ve como un símbolo roto: es un requisito del terminal, no se degrada (ver `mission.md`)

### Segmento que falla

- GIVEN un segmento que lanza un error al pintarse
- WHEN se pinta su línea
- THEN en su lugar se pinta `⚠` en gris, con su separador, y el resto de segmentos se pinta igual
- AND con `{"workspace":{"project_dir":123}}` la L1 es `⚠ │ 🤖 ? │ …` y la L2 se pinta entera
- AND un segmento sin datos no es un fallo: se omite o usa su valor por defecto, sin `⚠`

### Número de líneas

- GIVEN cualquier entrada
- WHEN el statusline termina
- THEN ha escrito en stdout una línea por cada línea del layout que tenga algo que pintar, separadas por un salto de línea y sin salto final
- AND sin `statusline.json`, el layout es el de la v1.2.0: L1 perfil, ubicación, modelo, caveman, ponytail y velocity; L2 reloj, contexto, 5h, semanal y coste
- AND con `{"lines": [["model"],["cost"],["duration"]]}` escribe tres líneas: `🤖 Opus`, `💰 $0.42` y `⏱️ …`
- AND una línea sin nada que pintar se omite: `[["caveman"], ["cost"]]` sin caveman activo escribe solo la línea del coste
- AND un segmento repetido se pinta cada vez: `[["cost", "cost"]]` escribe `💰 $0.42 │ 💰 $0.42`
- AND no escribe nada en stderr

### Configuración inválida

- GIVEN un `statusline.json` inválido (ver `input.md`)
- WHEN se pinta el statusline
- THEN pinta el layout de la v1.2.0 y la L1 acaba en ` │ ⚠`, con el `⚠` en gris
- AND con `{"lines": "where"}` y modelo `Opus`, la L1 acaba en `🤖 Opus │ ⚠` y la L2 se pinta entera

### Nombre de segmento desconocido

- GIVEN un layout con un nombre que no es de ningún segmento (los nombres distinguen mayúsculas: `Where` no es `where`)
- WHEN se pinta su línea
- THEN en su sitio se pinta `⚠` en gris, con su separador, y el resto del layout se respeta
- AND `[["where", "modle", "cost"]]` pinta `statusline  <rama> │ ⚠ │ 💰 $0.42`

## Reglas de la capacidad

- **Dónde viven los datos**: no aplica. Solo se escribe en stdout.
- **Idioma de los nombres**: el texto que se pinta va en inglés (`5h`, `7d`).
- **Límites**: tantas líneas como tenga el layout; sin `statusline.json`, dos. No hay ancho máximo: una línea más larga que el terminal no se trunca.
- **Avisos**: `⚠` gris en el sitio de un segmento que falla o de un nombre desconocido, y al final de la L1 con un `statusline.json` inválido.
- **Regla ante conflicto**: no aplica.
