---
id: 20261004-152212-patch-0014-caveman-modes
task: 0014
title: Patch — el icono de caveman desaparece con caveman 3.x
type: patch
solution: causa raíz
status: done
created: 2026-10-04
branch: chore/0014-caveman-modes
commit: 7518296
---

# Patch 0014 — el icono de caveman desaparece con caveman 3.x

## Capacidades

- Modificadas: `session-state` — «Modo caveman» admite los modos de caveman 3.x.

## 1. Síntoma

«he perdido el icono de caveman» — la L1 de `~\.claude` no pinta `🗿`; la de `~\.claude-gco` sí.

## 2. Causa raíz

`~\.claude\.caveman-active` contiene `caveman` (escrito el 2026-10-04 a las 16:00); el de `~\.claude-gco`, `lite`. `readEnv` lee el flag con una lista blanca (`statusline.js`, `readFlag(... '.caveman-active', ['lite', 'full', 'ultra', 'wenyan-lite', …])`) que no tiene `caveman`, así que lo descarta y el segmento no aparece.

El plugin caveman 3.1.0 cambió los modos: `codex-sessionstart.js` del plugin declara `'off', 'caveman', 'ultracave', 'megacave'` y traduce los antiguos (`lite`/`full` → `caveman`, `ultra` → `ultracave`, `wenyan*` → `megacave`). No lo causó la instalación de 0010–0013: la versión instalada antes tenía la misma lista.

Reproducido en RED: con `CLAUDE_CONFIG_DIR` temporal y `.caveman-active = caveman`, `node statusline.js` no pinta `🗿 caveman`.

## 3. Fix

- **Fichero(s)**: `statusline.js`, `statusline.test.js`
- **Cambio**: la lista blanca de `.caveman-active` añade `caveman`, `ultracave` y `megacave`, y conserva los modos 2.x para los perfiles que aún los escriben.
- **Decisiones**:
  - Se conservan los modos 2.x en la lista — sin el dev-lead (no cambia lo que se ve: `~\.claude-gco` sigue pintando `🗿 lite`)

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | RED: perfil temporal con `caveman` → sin `🗿` | ✅ falla con `AssertionError: caveman caveman visible` |
| 2 | GREEN: `caveman`, `ultracave`, `megacave` y `lite` → `🗿 <modo>`; `off` → sin `🗿` | ✅ `statusline.test.js OK` |
| 3 | Ejecución real con el perfil `~\.claude` | ✅ L1 `… │ 🗿 caveman │ 🦥 full` |

Validación diferida: 2026-10-04 · «he perdido el icono de caveman» · disparador: el próximo refresco del statusline en `~\.claude` tras instalar, a cargo del dev-lead

## 5. Tiempo (ligero)

- Real: 0,2h

## 6. Delta de capacidad

### Capacidad: `session-state`

**MODIFIED — Modo caveman**
- GIVEN el flag `.caveman-active` con un modo válido
- WHEN se pinta la L1
- THEN se muestra `🗿 <modo>`
- AND los modos válidos son los de caveman 3.x (`caveman`, `ultracave`, `megacave`) y los de 2.x (`lite`, `full`, `ultra`, `wenyan-lite`, `wenyan`, `wenyan-full`, `wenyan-ultra`, `commit`, `review`, `compress`)
- AND si existe `.caveman-statusline-suffix`, su contenido se añade detrás del modo
- AND con `CAVEMAN_STATUSLINE_SAVINGS=0` el sufijo no se muestra
