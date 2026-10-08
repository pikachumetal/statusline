---
id: 20261008-152437-patch-0019-missing-0002-tests
task: 0019
title: Patch — tests que faltan tras la 0002
type: patch
solution: dev-lead
status: done
created: 2026-10-08
branch: patch/0019-missing-0002-tests
commit: c87a051
---

# Patch 0019 — tests que faltan tras la 0002

## Capacidades

- Ninguna, porque el patch solo añade asserts de lo que ya dicen `output` («Color»), `input` («Directorio del proyecto») e `installation` («Wrapper de Orca»), que ya constan con test.

## 1. Síntoma

Fila de deuda técnica del roadmap: «Tests pendientes tras la 0002: colores atenuados del resto de fragmentos (perfil, effort, sufijo, `5h`/`7d`, reset, coste) y velocity verde/rojo; el `cwd` que recibe `git` según la precedencia; el wrapper de Orca descartando la salida del hook y sin hook (Minor #5, #9, #10 de la revisión final de la 0002)». Impacto: esos detalles pueden romperse sin que falle la suite.

## 2. Solución fijada

Petición del dev-lead: «Solo se añaden asserts a statusline.test.js, en los bloques de la 0002. statusline.js no se toca», con tres coberturas: los colores atenuados y velocity, el `cwd` que recibe `git` según la precedencia, y el wrapper de Orca (descarta la salida del hook; funciona igual sin hook). «Cada assert debe fallar si el comportamiento cambia».

Existe todo lo que la petición da por existente: los colores en `renderLine1`, `renderFiveHour`, `renderSevenDay`, `renderCost` y `renderVelocity`; la precedencia en `projectDir`, que usa `readGit`; y el `>nul 2>&1` y el `if exist` en `statusline-orca.cmd`.

## 3. Fix

- **Fichero(s)**: `statusline.test.js`
- **Cambio**: bloque «Color»: perfil en magenta; effort, sufijo, `5h`, `7d`, los dos `↻` y el coste atenuados (`130;130;130`); `+N` en verde y `-N` en rojo. Bloque «Directorio del proyecto»: el `cwd` que `readGit` pasa a `git` en los tres casos de precedencia, y de punta a punta un `project_dir` fuera de git que manda sobre un `cwd` dentro del repo. Bloque «Wrapper de Orca»: un hook que escribe en stdout y stderr no deja rastro en la salida, y sin hook el wrapper sale con 0, pinta lo mismo, no escribe en stderr y borra el temporal.
- **Decisiones**:
  - El perfil se prueba en magenta, no atenuado: así lo dice `output` («el perfil y el modelo, en magenta») y así lo pinta el código; la petición lo agrupa con los atenuados — sin el dev-lead (no cambia lo que se ve: lo fija la capacidad)
  - El test de punta a punta fija `GIT_CEILING_DIRECTORIES` al padre del temporal: en esta máquina `%TEMP%` es un repo git y el temporal «fuera de git» no lo estaba — sin el dev-lead (solo del test)

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | Suite completa | ✅ `statusline.test.js OK` |
| 2 | 10 mutaciones de color (perfil, effort, sufijo, `5h`, `7d`, `↻` de 5h y de 7d, coste, `+` verde, `-` rojo) | ✅ 10/10 en rojo, cada una en su assert nuevo |
| 3 | Precedencia: `current_dir` antes que `project_dir`; `cwd` antes que `current_dir` | ✅ en rojo; aisladas de los asserts del nombre, `git` recibe `/a/cur` y `/a/cwd` donde espera `/a/proj` y `/a/cur` |
| 4 | `readGit` pasa `process.cwd()` a `git`; `git` sin `-C` | ✅ 2/2 en rojo («git en project_dir», «git corre en project_dir, no en cwd») |
| 5 | Wrapper sin `>nul 2>&1`, solo sin `2>&1`, solo sin `>nul` | ✅ 3/3 en rojo («la salida de Orca se descarta») |
| 6 | Wrapper sin hook: sale con 1, deja el temporal, escribe en stderr, pinta solo con hook | ✅ 4/4 en rojo, cada una en su assert |
| 7 | Quitar el `if exist` del wrapper | Sobrevive: mutación equivalente. El `call` a un hook inexistente ya va a `>nul 2>&1` y el wrapper sale con `exit /b 0`, así que no cambia nada observable |

Todas las mutaciones se deshicieron tras cada corrida: `git status` solo muestra `statusline.test.js`. Ningún test destapó un fallo real.

Validación diferida: 2026-10-08 · perfil `unattended` sin `validation.mode: field` · disparador: smoke de la release 2.0.0, a cargo del dev-lead

## 5. Tiempo (ligero)

- Real: 0,4h
