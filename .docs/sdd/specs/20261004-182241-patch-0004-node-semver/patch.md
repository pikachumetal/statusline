---
id: 20261004-182241-patch-0004-node-semver
task: 0004
title: Patch — el lanzador elige el Node de proto por nombre, no por versión
type: patch
solution: causa raíz
status: done
created: 2026-10-04
branch: chore/0004-node-semver
commit: <hash>
---

# Patch 0004 — el lanzador elige el Node de proto por nombre, no por versión

## Capacidades

- Modificadas: `installation` — «Lanzador»: la versión de Node de proto se elige por SemVer.

## 1. Síntoma

Fila 0004 del roadmap: «`statusline.cmd` elige la versión de Node de proto por orden alfabético del nombre de carpeta, no por SemVer. Hoy elige bien (`26.9.0`). Una `9.x` instalada ganaría a una `26.x`.»

Medido el 2026-10-04, peor que lo reportado: hoy **no** elige bien. Con `18.20.8`, `24.x`, `26.1.0`, `26.8.x`, `26.9.0` y `26.10.0` instaladas, `dir /b /ad /o-n` ordena `globals`, `26.9.0`, `26.8.2`… y el lanzador arranca la `26.9.0`, no la `26.10.0`.

## 2. Causa raíz

`statusline.cmd` recorre `dir /b /ad /o-n "%BASE%"` y lanza el primer `node.exe` que encuentra. `/o-n` ordena por nombre como texto, descendente: `9.0.0` > `26.0.0` y `26.9.0` > `26.10.0`.

Reproducido: con un `USERPROFILE` temporal que tiene `9.0.0` (`hostname.exe` como `node.exe`) y `26.0.0` (enlace duro al `node.exe` real), el lanzador ejecuta el de `9.0.0` y no pinta nada; con solo `26.0.0`, pinta `🤖 ?`.

## 3. Fix

- **Fichero(s)**: `statusline.cmd`, `statusline.test.js`
- **Cambio**: el lanzador recorre las carpetas con `node.exe`, separa `major.minor.patch` (también ante un sufijo `-rc`) y se queda con la mayor comparando números; un nombre que no es versión cuenta como `0.0.0`.
- **Decisiones**:
  - Ordenar por versión y no respetar la versión fijada por proto (`.prototools`): las dos vías estaban escritas en la fila de deuda; la fijada depende del directorio de trabajo, que el lanzador no conoce — sin el dev-lead (no cambia lo que se ve)

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | RED: proto falso con `9.0.0`, `26.9.0` (`hostname.exe`) y `26.10.0` (node real), más `globals` | ✅ falla con `statusline.cmd usa la 26.10.0, no la 9.0.0 ni la 26.9.0: «»` |
| 2 | GREEN: `node statusline.test.js` | ✅ `statusline.test.js OK` |
| 3 | Ejecución real con el proto de la máquina: copia del lanzador que imprime la elección | ✅ `elegido: 26.10.0` |
| 4 | Ejecución real del lanzador | ✅ L1 `🤖 ? │ 🗿 caveman │ 🦥 full` |

Validación diferida: 2026-10-04 · «ok! dale unattended» · disparador: smoke de la release 1.1.0, a cargo del dev-lead

## 5. Tiempo (ligero)

- Real: 0,3h

## 6. Delta de capacidad

### Capacidad: `installation`

**MODIFIED — Lanzador**
- GIVEN `statusline.cmd` y `statusline.js` en la misma carpeta
- WHEN Claude Code ejecuta `statusline.cmd`
- THEN si existe `%USERPROFILE%\.proto\tools\node`, lanza `statusline.js` con el `node.exe` de la versión más alta por SemVer (`26.10.0` antes que `26.9.0`, y `26.x` antes que `9.x`); una carpeta sin `node.exe` se ignora y un nombre que no es versión cuenta como `0.0.0`
- AND usa el `node.exe` real de proto y no su shim, que a veces inyecta una línea NDJSON en stdout que ensuciaría el statusline
- AND si no hay proto, usa el `node` del PATH
- AND el código de salida es siempre 0
