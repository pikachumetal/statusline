---
id: 20261004-214415-feature-0002-untested-requirements
feature: 0002
title: Walkthrough — Tests de los requisitos sin cobertura
spec: ./spec.md
plan: ./plan.md
status: done
created: 2026-10-04
---

# Walkthrough — Tests de los requisitos sin cobertura

## 1. Cambios realizados

- `statusline.test.js` — tests de perfil (con y sin `CLAUDE_CONFIG_DIR`), valor y hardening de los ficheros flag (vacío, `off`, inválido, ausente, >64 bytes, carpeta, symlink, primera línea, saneado de caracteres), escritura nula en el perfil, saneado del sufijo, precedencia de `project_dir`, detached HEAD (en `readGit` y en la L1), color del porcentaje en los cortes 19/20, 69/70, 89/90 en contexto, 5h y 7d, reset de color por segmento, colores de repo/branch/modelo y wrapper de Orca. (`12064ff`, pasada de fix `9b719e7`)
- Capacidades: líneas `> Cobertura:` al día en los requisitos cubiertos.
- Spec y plan. (`fce57c9`)

## 2. Tiempo y coste: estimado vs real

- Tipo: chore
- Estimación de implementación (del plan): 0,5h
- Esfuerzo real: 0,6h — reloj del hilo aproximado con las marcas de los commits (rama 23:44, task 23:47, pasada de fix 23:54) más el recuento previo y el cierre
- Desviación: +0,1h (+20 %)
- Causa de la desviación: no aplica
- Modelo del hilo: Opus 5.5, effort no registrado
- Tokens del hilo: 9.802.410 — claude-opus-5-5 9.802.410 (incluye toda la sesión anterior a la rama)
- Tokens de subagentes: 496.768 en 1 despacho — Revisión final feature 0002 claude-sonnet-5-5 496.768 / 2 min
- Coste de la sesión: sin precio (sin tabla pricing en sdd-kit.json)
- Coste de sujetos: no aplica
- Review de spec: no · hallazgos 0, aceptados 0

## 3. Desviaciones del plan

- Revisión final con `sdd-kit:effort-medium` + `sonnet`, confirmada por el dev-lead al despachar («Sí, Sonnet medium (Recommended)»).
- Native sin `task-start`/`task-done` ni ledger: una task.
- Sin RED (tests de comportamiento existente): 6 mutaciones del código (tamaño del flag, saneado, precedencia, detached, flag vacío, corte del 70) ponen cada test en rojo. La mutación de detached destapó un falso rojo en mi propio test (`!includes('X')` con un nombre de perfil aleatorio que podía tener `X`); corregido antes del commit.

### Decisiones tomadas sin el dev-lead

- Modo full en vez de lite — lite necesita la confirmación del dev-lead y el perfil es `unattended` — coste si está mal: spec y plan de más.
- Pasada de fix de los 3 Important (`CAVEMAN_STATUSLINE_SAVINGS` heredado del usuario, reproducido en rojo; cortes del color sin probar; perfil sin variable sin probar) y de 5 Minor baratos (#4, #7, #8, #11, #12). La pasada de fix de Native no abre re-revisión — coste si está mal: ninguno, la suite pasa con y sin la variable exportada.
- Minor diferidos (#5 resto de colores atenuados y velocity, #9 directorio que recibe `git`, #10 detalles del wrapper de Orca) y rechazado #6 (el test ya usa el escape ``, no el glifo pegado) — coste si está mal: esos detalles siguen sin assert.
- El saneado del sufijo deja pasar `DEL` (`0x7F`) y los C1 (`0x9B`, CSI de un byte): incumple «un fichero externo no puede inyectar secuencias ANSI». No se arregla aquí (decisión 6 de la spec) — coste si está mal: un fichero `.caveman-statusline-suffix` manipulado podría colar una secuencia en terminales que interpretan C1.

## 4. Verificación

### 4.1 Builds

- Sin build: Node sin compilar.
- Suite completa: `node statusline.test.js` → `statusline.test.js OK` · ~10 s; también con `CAVEMAN_STATUSLINE_SAVINGS=0` exportado, y tres veces seguidas.

### 4.2 Smoke / tests

- Validación diferida: 2026-10-04 · «ok! dale unattended» · disparador: smoke de la release 1.1.0, a cargo del dev-lead

Revisión final: sdd-kit:effort-medium + sonnet, con hallazgos (3 Important y 9 Minor), sobre 12064ff.
Pasada de fix: 9b719e7, 3 Important y 5 Minor; el Important #1 reproducido en rojo antes.

| Requisito | Evidencia | Resultado |
| --- | --- | --- |
| Perfil (con, `.claude` y sin variable) | suite | ✅ |
| Valor de un flag | suite + mutación | ✅ |
| Lectura de ficheros flag (incl. symlink, creado en esta máquina) | suite + mutación | ✅ |
| Saneado del sufijo | suite + mutación | ✅ (con el hueco de `DEL`/C1, ver 4.3) |
| Directorio del proyecto | suite + mutación | ✅ (nombre; el `cwd` de `git`, diferido) |
| Ubicación en detached HEAD | suite + mutación | ✅ |
| Color del porcentaje | suite + mutación | ✅ |
| Color (reset por segmento; repo, branch, modelo) | suite | ✅ (resto de colores, diferido) |
| Wrapper de Orca | suite (Windows) | ✅ |

### 4.3 Residuales / deuda generada

- Saneado del sufijo: `DEL` y los C1 (`0x80`–`0x9F`) pasan. → deuda técnica, impacto medio, patch.
- Minor #5, #9, #10 de la revisión. → deuda técnica.
- `Merge-CapabilityDelta.ps1` borra la línea `> Cobertura:` al fusionar un requisito: 16 se quedaron sin ella hoy; se repuso solo en los que toca esta feature. → ticket del kit.

## 5. Aprendizajes

- Un test que busca la ausencia de un carácter suelto (`X`) en una salida que incluye un nombre aleatorio es frágil: buscar una secuencia propia del caso (`[31mX`). → ninguno de los docs vivos lo trata; queda aquí y en el ticket del kit.
- Los tests que lanzan `statusline.js` tienen que fijar las variables que lee (`CAVEMAN_STATUSLINE_SAVINGS`, `CLAUDE_CONFIG_DIR`, `USERPROFILE`): heredarlas del usuario los hace depender de su máquina. → `architecture.md` no lo cubre; se añade allí.
- Revisión de skills: no aplica — el repo no tiene `.claude/skills/` (mirado).

## 6. Adendas

- 2026-10-05 — Validado en el smoke de la release 1.1.0: «Validado: lo he probado y funciona» · no detalló qué probó — el dev-lead
