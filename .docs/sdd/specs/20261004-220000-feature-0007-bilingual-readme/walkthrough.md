---
id: 20261004-220000-feature-0007-bilingual-readme
feature: 0007
title: Walkthrough — README bilingüe
spec: ./spec.md
plan: ./plan.md
status: done
created: 2026-10-05
---

# Walkthrough — README bilingüe

## 1. Cambios realizados

- `README.md` — al día con lo entregado desde la v1.0.0: ejemplo generado con `render`, sección «Qué muestra» (icono de nivel, sub-bloques, marcador de ritmo, `↻`, `$/h`, `⚠`), lanzador por SemVer, Instalar, Actualizar, Orca y Test. (`99152c2`, pasada de fix `643aa07`)
- `README.en.md` — la misma estructura y los mismos bloques en inglés, con enlace cruzado en la primera línea de cada uno. (`99152c2`, `643aa07`)
- `constitution.md` — la regla 2 fija la forma: dos ficheros con enlace cruzado.
- Spec y plan. (`ca6a30e`)

## 2. Tiempo y coste: estimado vs real

- Tipo: docs
- Estimación de implementación (del plan): 0,3h
- Esfuerzo real: 0,15h — reloj del hilo aproximado con las marcas de los commits (rama 00:00, task 00:01, pasada de fix 00:06)
- Desviación: -0,15h (-50 %)
- Causa de la desviación: la estructura ya existía y el ejemplo salió del render; solo hubo que reescribir y traducir.
- Modelo del hilo: Opus 5.5, effort no registrado
- Tokens del hilo: 5.874.019 — claude-opus-5-5 5.874.019 (incluye toda la sesión anterior a la rama)
- Tokens de subagentes: 222.901 en 1 despacho — Revisión final feature 0007 claude-sonnet-5-5 222.901 / 1 min
- Coste de la sesión: sin precio (sin tabla pricing en sdd-kit.json)
- Coste de sujetos: no aplica
- Review de spec: no · hallazgos 0, aceptados 0

## 3. Desviaciones del plan

- Revisión final con `sdd-kit:effort-medium` + `sonnet`, elegida por el dev-lead al despachar («Sonnet medium (Recommended)»).
- Pasada de fix de los 4 Minor de la revisión, más dos retoques del hilo (una frase con dos «y» seguidas en la sección Orca y «grey» → «gray»). Es documentación, 9 líneas: revisado en el hilo.

### Decisiones tomadas sin el dev-lead

- Modo full en vez de lite — lite necesita la confirmación del dev-lead y el perfil es `unattended` — coste si está mal: spec y plan de más.
- Dos ficheros en vez de uno con dos secciones — cada lector lee solo su idioma — coste si está mal: mantener dos ficheros en paralelo.
- Inglés americano (`color`, `gray`, como `truecolor`) — coherente con los términos técnicos — coste si está mal: ninguno.
- La frase de Orca deja de decir que Orca «lee `rate_limits`»: ninguna capacidad lo respalda (hallazgo de la revisión) — coste si está mal: el README dice menos de lo que hace Orca.

## 4. Verificación

### 4.1 Builds

- Sin build. `node statusline.test.js` → `statusline.test.js OK` (sin cambios de código).

### 4.2 Smoke / tests

- Validación diferida: 2026-10-05 · «ok! dale unattended» · disparador: smoke de la release 1.1.0, a cargo del dev-lead

Revisión final: sdd-kit:effort-medium + sonnet, con hallazgos (4 Minor), sobre 99152c2.
Pasada de fix: 643aa07, 4 Minor; documentación, revisada en el hilo.

| Criterio | Evidencia | Resultado |
| --- | --- | --- |
| Dos ficheros con enlace cruzado | lectura | ✅ |
| Mismas secciones y bloques idénticos | `Select-String '^#'` y comparación de los bloques de código | ✅ 6/6 secciones, 3/3 bloques |
| El ejemplo es el render real | revisión: coincide carácter a carácter con `render` | ✅ |
| Cada afirmación respaldada por `capabilities/` | revisión + pasada de fix | ✅ |

### 4.3 Residuales / deuda generada

- Ninguna.

## 5. Aprendizajes

- El README envejece con cada feature que cambia lo que se ve: el de la v1.0.0 llevaba un ejemplo sin cinco segmentos de hoy. → la regla 2 de `constitution.md` dice ya que los dos ficheros dicen lo mismo; queda como punto a mirar en el cierre de cada release.
- Revisión de skills: no aplica — el repo no tiene `.claude/skills/` (mirado).

## 6. Adendas
