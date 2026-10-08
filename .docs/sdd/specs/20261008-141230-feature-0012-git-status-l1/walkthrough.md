---
id: 20261008-141230-feature-0012-git-status-l1
feature: 0012
title: Walkthrough — Estado de git en la L1
spec: ./spec.md
plan: ./plan.md
status: done
created: 2026-10-08
---

# Walkthrough — Estado de git en la L1

## 1. Cambios realizados

- `statusline.js`: `parseStatus` lee las cabeceras de `git status --porcelain=v2 --branch` (rama, hash en detached HEAD, `branch.ab`) y marca cambios con cualquier línea sin `#`. `readGit` hace dos llamadas (`rev-parse` de rutas y `status`) en lugar de hasta tres, y marca `timedOut` cuando una llamada vuelve vacía con el plazo vencido o no se lanza. `renderWhere` pinta `●` (amarillo), `↑N↓M` (gris atenuado) o `⚠` tras la rama. Task 1 `26f642a`, Task 2 `bcd2e2b`.
- `statusline.test.js`: tests de `parseStatus` (9 casos), de `readGit` (dos llamadas, `status` que falla, presupuesto agotado tras las rutas y en las rutas) y del pintado (colores, ceros ocultos, orden con el worktree, `⚠`). Los tests de presupuesto y detached HEAD de la 0001/0002 se reescribieron para simular `status`.
- Docs: delta fusionado en `capabilities/session-state.md` e `input.md`; `architecture.md` (flujo, plazo, exports).

## 2. Tiempo y coste: estimado vs real

- Tipo: backend
- Estimación de implementación (del plan): 1h
- Esfuerzo real: 0.15h — reloj del hilo por las marcas de los commits: implementación, revisión final y pasada de fix de 16:14 a 16:23; spec y plan, 16:08–16:14 (0.1h), fuera de este ratio
- Desviación: -0.85h (-85 %)
- Causa de la desviación: la estimación sale de la mediana del log, medida con sesiones que paraban en gates; aquí el perfil `unattended` y la ejecución Native en una sola sesión no tuvieron paradas, y el plan ya llevaba el diseño y los casos de test
- Modelo del hilo: Opus 5.5, effort no registrado
- Tokens del hilo: 11.777.772 — claude-opus-5-5 11.777.772 (incluye la migración a 2.3.3, anterior a la feature en esta sesión)
- Tokens de subagentes: 604.417 en 1 despacho — Revisión final 0012 bcd2e2b claude-opus-5-5 604.417 / 2 min
- Coste de la sesión: sin precio (sin tabla pricing en sdd-kit.json)
- Coste de sujetos: no aplica
- Review de spec: no · hallazgos 0, aceptados 0

## 3. Desviaciones del plan

- El test de color «segmento sin reset final» no se tocó: la comprobación de que la ubicación con marcas cierra su color va en el bloque de la Task 2.

### Decisiones tomadas sin el dev-lead

- Las de la spec y el plan, en sus bloques «Decisiones que he tomado yo» (perfil `unattended`).
- Ruling: comprobación de color aparte en vez de modificar el test existente — misma cobertura sin tocar un test ajeno — coste si está mal: ninguno.
- Revisión final (opus, effort high) sobre `bcd2e2b`: 1 Important arreglado en la pasada de fix, juntada en el cierre (`# stash N`, que git añade con `status.showStash`, pintaba `●` con el árbol limpio; test `parseStatus: # stash (status.showStash) no es un cambio` RED→GREEN).
- Minor diferido: el test `git falta …` no afirma la ausencia de marcas con un `env.git` sin `dirty`/`ahead`/`behind` (el código sí la cumple).
- Minor diferido (confianza baja): un timeout real que vuelva 1 ms antes de `deadline` no se marcaría y pintaría `?` sin `⚠`.

## 4. Verificación

### 4.1 Builds

- Sin build. Suite completa: `node statusline.test.js` → `statusline.test.js OK` · 9,3 s.

### 4.2 Smoke / tests

Validación diferida: 2026-10-08 · perfil `unattended`: la validación del dev-lead se difiere · disparador: smoke de la release 2.0.0, a cargo del dev-lead

Smoke del agente: `statusline.js` lanzado con `{"cwd": …}` sobre repos temporales con git 2.55 (salida sin ANSI).

| THEN | Evidencia | Resultado |
| --- | --- | --- |
| `●` con cambios (sin seguimiento, modificados) | ejecución real | `cl  main ●`; `cl  main ● ↑1↓2` |
| `↑N↓M` solo mayores que cero | ejecución real | `↑1` con ahead 1; `↑1↓2`; limpio al día sin flechas |
| Sin upstream, upstream borrado o detached: sin `↑↓` | ejecución real | `nou ●`, `main ●` tras `fetch --prune`, `9f9f2c7 ●` |
| Worktree detrás de las marcas | ejecución real (sin marcas) + suite | `cl  wt-x 🌳 wt-x`; orden `● ↑2 🌳 feat-x` en la suite |
| Presupuesto agotado tras las rutas: `? ⚠` | ejecución real | `core.fsmonitor` que duerme 4 s → `cl  ? ⚠` en 2351 ms de arranque a salida |
| `git status` que falla dentro de plazo: `?` sin marcas | suite | `git status que falla dentro de plazo` |
| Detached: 7 caracteres de `branch.oid` | ejecución real | `9f9f2c7` = `git rev-parse --short HEAD` |
| Sin repo: solo el nombre, sin `⚠` | ejecución real | `notrepo` |
| Presupuesto agotado en las rutas: `proj ⚠` | suite | `presupuesto agotado en las rutas`; no se puede provocar con `git` real: `rev-parse` no tiene hook lento |
| Sin directorio de proyecto: sin segmento | suite | test de la L1 sin ubicación |
| Dos llamadas: rutas y `status --porcelain=v2 --branch` | suite | `readGit hace dos llamadas a git` |
| `--no-optional-locks`, stderr descartado | suite (sin cambios en `git()`) | — |
| 1500 ms en rutas → ≤ 2000 ms y marca de agotado | suite | `readGit con git lento cabe en el presupuesto` |
| Statusline completo < 3000 ms en este repo | ejecución real + suite | `statusline  feature/0012-git-status-l1 🌳 feature-0012-git-status-l1` |
| Rama sin commits | ejecución real | `empty  main` |
| Árbol limpio con stash y `status.showStash` (fix de la revisión final) | ejecución real | `# stash 1` en `status` → `st  main`, sin `●` |

### 4.3 Residuales / deuda generada

- `maxBuffer` de 1 MB de `execFileSync`: un `status` mayor deja la rama en `?` (marcador `ponytail:` en `readGit`).

## 5. Aprendizajes

- `git status --porcelain=v2 --branch` no da las rutas del repo ni del worktree: la consulta mínima son dos llamadas → `architecture.md`.
- Un `core.fsmonitor` lento provoca de verdad el timeout de `git status` para un smoke → este walkthrough.

## 6. Adendas
