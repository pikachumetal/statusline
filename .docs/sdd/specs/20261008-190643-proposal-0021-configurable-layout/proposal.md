---
id: 20261008-190643-proposal-0021-configurable-layout
proposal: 0021
title: Layout configurable del statusline
source: interview
created: 2026-10-08
---

# Propuesta — Layout configurable del statusline

## Por qué

Hoy el statusline pinta siempre las mismas dos líneas con los mismos 11 segmentos en el mismo orden
(L1: perfil, ubicación, modelo, caveman, ponytail, velocity; L2: reloj, contexto, 5h, semanal, coste).
Quien no quiere un segmento, o lo quiere en otra línea, no tiene forma de cambiarlo. Se quiere poder
elegir qué segmentos se ven, en qué orden y en cuántas líneas, por perfil, sin cambiar nada para quien
no configure nada. Viene de la B1 del backlog.

## Reglas de negocio

- Origen: la configuración se lee de `<CLAUDE_CONFIG_DIR>/statusline.json` (sin la variable, `~/.claude/statusline.json`), una por perfil: con `CLAUDE_CONFIG_DIR=C:\Users\u\.claude-gco` se lee `C:\Users\u\.claude-gco\statusline.json` y la de `~/.claude` no influye.
- Formato: `{"lines": [[<segmento>, …], …]}`, una lista de líneas y cada línea una lista de nombres de segmento en el orden en que se pintan: `{"lines": [["where", "model"], ["context", "cost"]]}` → L1 `statusline  develop │ 🤖 Opus`, L2 `🟢 ▰▰… 12% │ 💰 $0.42`.
- Nombres de segmento: `profile`, `where`, `model`, `caveman`, `ponytail`, `velocity`, `duration`, `context`, `five_hour`, `seven_day`, `cost`: `["profile", "where"]` pinta el perfil y la ubicación; `["Where"]` no vale (los nombres distinguen mayúsculas) y cae en la regla del nombre desconocido.
- Número de líneas libre: `{"lines": [["where", "model", "context"]]}` → una sola línea; con tres listas, tres líneas. Una línea que se queda sin nada que pintar se omite: `[["caveman"], ["cost"]]` sin caveman activo → solo la línea del coste.
- Sin fichero, el layout de la v1.2.0 byte a byte, sin marca: perfil sin `statusline.json` → la misma salida que la v1.2.0 para el mismo stdin y el mismo entorno.
- Fichero inválido (JSON roto, `lines` que no es un array de arrays de strings, más del tamaño máximo o un symlink): layout por defecto con un `⚠` gris al final de la L1: `{"lines": "where"}` → las dos líneas de la v1.2.0 y la L1 acaba en ` │ ⚠`.
- Nombre desconocido: `⚠` gris en su sitio y el resto del layout se respeta: `[["where", "modle", "cost"]]` → `statusline  develop │ ⚠ │ 💰 $0.42`.
- Segmento repetido: se pinta las dos veces, que es lo que se ha pedido: `[["cost", "cost"]]` → `💰 $0.42 │ 💰 $0.42`.
- Un segmento sin datos se sigue omitiendo como hoy: `["velocity"]` en una sesión sin líneas cambiadas → no pinta nada en su sitio.
- `render` sigue siendo pura: recibe el layout ya parseado en `env.layout`; la lectura y la validación viven en `readEnv`.
- El instalador no crea, no copia y no modifica `statusline.json`: un update sobre un perfil con `statusline.json` lo deja byte a byte igual.

## Capacidades que toca

- `input` — la lectura de `statusline.json` y sus reglas de validación.
- `output` — el número de líneas deja de ser fijo y el `⚠` de configuración inválida.
- `session-state` — el orden de la L1 pasa a ser el orden por defecto, no el único.
- `usage` — el orden de la L2 pasa a ser el orden por defecto, no el único.

## Reparto

| Orden | Id | Feature | Tras |
| --- | --- | --- | --- |
| 1 | 0022 | Segmentos con nombre y render guiado por un layout, con el de la v1.2.0 por defecto y sin cambio visible | — |
| 2 | 0023 | `statusline.json` en el perfil: lectura endurecida, validación, `⚠`, N líneas y formato documentado en el README (es/en) | 0022 |

Decisiones abiertas para la spec de la 0023: el tamaño máximo del fichero (se propone 4 KB) y si un
`lines` vacío (`[]`) cuenta como inválido o pinta nada.

## Acta

No aplica: entrevista.

## Enmiendas

