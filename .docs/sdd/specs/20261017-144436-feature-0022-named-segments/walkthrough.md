---
id: 20261017-144436-feature-0022-named-segments
feature: 0022
title: Walkthrough — Segmentos con nombre y render guiado por un layout
spec: ./spec.md
status: done
created: 2026-10-17
---

# Walkthrough — Segmentos con nombre y render guiado por un layout

## 1. Cambios realizados

- `statusline.js`: `renderLine1` y `renderLine2` desaparecen. Los 11 segmentos pasan a un registro `SEGMENTS` por nombre; `render` recorre `env.layout` (por defecto `DEFAULT_LAYOUT`, el de la v1.2.0), pinta cada nombre dentro de `segment()` con `renderLine`, omite las líneas vacías y une con `\n`. Un nombre que no está en `SEGMENTS` pinta `FAILED`. Commit `d914b85`, juntado en el cierre.
- `statusline.test.js`: bloque del layout con los 6 criterios de la spec.
- `.docs/sdd/architecture.md`: el flujo y la regla «un segmento, una entrada en `SEGMENTS`».

## 2. Tiempo y coste: estimado vs real

- Tipo: backend
- Estimación de implementación (del plan): 1h (de la spec lite)
- Esfuerzo real: 0.5h — reloj del hilo aproximado (spec aprobada hacia las 17:00, último arreglo 17:26 hora local, más la revisión)
- Desviación: -0.5h (-50 %)
- Causa de la desviación: el refactor fue mecánico (cada entrada de `SEGMENTS` copia su trozo) y la suite existente ya protegía la salida; no hubo que escribir tests de regresión.
- Modelo del hilo: Opus 5.5, effort medium
- Tokens del hilo: 18.420.683 — claude-opus-5-5 18.420.683
- Tokens de subagentes: 652.430 en 1 despacho — Revisor final 0022 claude-opus-5-5 652.430 / 1 min
- Coste de la sesión: sin precio (sin tabla pricing en sdd-kit.json)
- Coste de sujetos: no aplica
- Review de spec: no

## 3. Desviaciones del plan

- _Ninguna_ (modo lite, sin plan): la implementación sigue el Approach de la spec.

### Decisiones tomadas sin el dev-lead

- Important de la revisión final (comentario del test que citaba `(0022)`) y Minor 2 (viñeta de `architecture.md` con dos reglas) arreglados en el hilo — comentario y docs, menos de 20 líneas — coste si incorrecto: ninguno.
- Minors aplazados: el comentario de `SEGMENTS` roza repetir el código; el test «layout explícito = sin layout» pasa por construcción (la equivalencia real la protege la suite antigua); la cabecera de `statusline.js` dice «dos líneas».

## 4. Verificación

### 4.1 Builds

- Suite completa: `node statusline.test.js` → `statusline.test.js OK` · ~10 s; `claude plugin test mod` → 43 pass · 3 s.

### 4.2 Smoke / tests

- Validación diferida: 2026-10-17 · «diferir» · disparador: smoke de la release 2.0.0, a cargo del dev-lead (mirar que la status line se ve igual que antes).

| Criterio | Evidencia | Resultado |
| --- | --- | --- |
| Sin layout, la salida es la de hoy | ejecución real | `statusline.js` de `develop` y de la rama, mismo stdin (completo, `{}` y vacío): salidas iguales byte a byte; la suite antigua en verde sin tocar asserts; el revisor comparó 20 combinaciones, 0 diferencias |
| Layout de la v1.2.0 explícito = sin layout | suite | iguales |
| `[['cost', 'model']]` | suite | una línea, coste y modelo |
| `[['where', 'modle', 'cost']]` | suite | `⚠` gris en el sitio de `modle` |
| `[['caveman'], ['cost']]` sin caveman | suite | solo la línea del coste |
| `[['cost', 'cost']]` | suite | coste dos veces |

### 4.3 Residuales / deuda generada

- Un layout mal formado (`{}`, `'cost'`, `[null]`) hace lanzar a `render`: la 0023 tiene que validar la forma antes de pasarlo (anotado para la 0023).
- Los minors de §3, en la deuda técnica del roadmap.

## 5. Aprendizajes

- La forma de pintar una status line configurable: registro por nombre más un layout que lo recorre, con `segment()` alrededor de cada nombre → `architecture.md` («Separación que hay que conservar»).
- `render` no valida la forma del layout; quien lo construya (la 0023) lo valida antes → `architecture.md`.

## 6. Adendas
