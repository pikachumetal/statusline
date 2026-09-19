# Roadmap — statusline

## Estado

El producto se queda como está (ver `mission.md`). Lo que sigue son módulos
identificados sin compromiso de fecha ni de orden. La partición fina en tasks
se hace cuando `capabilities/` madure.

## Módulos identificados

| Módulo | Qué es | Estado |
| --- | --- | --- |
| Avisos de cuota | Icono de alerta en las ventanas de 5h y semanal, como el del contexto. El color del porcentaje ya existe. | Pendiente (regla 4 de `constitution.md`) |
| Errores visibles | Marcador discreto (`⚠`) cuando un segmento falla, en vez de omitirlo sin avisar. | Pendiente (regla 4) |
| Presupuesto de tiempo | Tope de tiempo total del render, comprobado con un test. Sin cifra todavía. | Pendiente (regla 3) |
| README bilingüe | Castellano e inglés. La forma (un fichero o dos) la decide su task. | Pendiente (regla 2) |
| Configurabilidad | Elegir qué segmentos se ven, en qué orden y en cuántas líneas. | Sin compromiso |
| Segmentos nuevos | Sin lista concreta todavía. | Sin compromiso |
| Lanzador para macOS y Linux | Hoy se configura a mano. | Sin compromiso |

## Deuda técnica

| Deuda | Impacto | Vía de mejora |
| --- | --- | --- |
| `readGit` hace hasta 3 llamadas a `git`, cada una con 2 s de timeout | 6 s de bloqueo en el peor caso, en cada refresco | Una sola llamada a `git` que devuelva todo, o un timeout global. Es lo que acota el módulo «Presupuesto de tiempo». |

## Issues de GitHub

Un issue se triagea y acaba como fila de «Módulos identificados» o de «Deuda
técnica», con su referencia (`#N`). Los issues no sustituyen a este roadmap.

## Patches

| Fecha | Patch | Rama | Carpeta |
| --- | --- | --- | --- |
