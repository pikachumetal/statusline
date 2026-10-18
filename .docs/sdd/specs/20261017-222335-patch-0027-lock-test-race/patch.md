---
id: 20261017-222335-patch-0027-lock-test-race
task: 0027
title: Patch — carrera del test del fichero en uso del instalador
type: patch
solution: causa raíz
status: done
created: 2026-10-18
branch: patch/0027-lock-test-race
commit: d0d5b52
---

# Patch 0027 — carrera del test del fichero en uso del instalador

## Capacidades

- Ninguna, porque ninguna capacidad describe el andamiaje de `statusline.test.js`.

## 1. Síntoma

`node statusline.test.js` falla de vez en cuando:
- el 2026-10-18, en la verificación de `Invoke-SddMerge.ps1` del patch 0026, con un `assert.ok` que dio `false`;
- después, en la del chore de las líneas sueltas, con este error:

```
Error: EBUSY: resource busy or locked, open '…\statusline-install-xZ9sOi\busy\hooks\statusline.cmd'
```

(log: `sdd-merge-verify-20261018-002253-72312.log`). Lanzada a mano pasaba 6 de 6.

## 2. Causa raíz

El test «Fichero en uso» del patch 0026 (`holding` en `statusline.test.js`) deja `statusline.cmd` abierto con un `pwsh` hijo y, al acabar, lo mata con `taskkill /pid … /t /f`. Justo después escribe en ese fichero (`appendFileSync`).

`taskkill /f` devuelve antes de que Windows libere los handles del proceso. Cuando la escritura llega antes que la liberación, sale `EBUSY`. Con más carga, el `install.ps1` siguiente también encuentra el fichero abierto y falla su assert.

Evidencia: el `EBUSY` sale en el `open` de `appendFileSync`, justo después de `holding()`.

## 3. Fix

- **Fichero:** `statusline.test.js` (solo el test).
- **Cambio:** el `pwsh` hijo cierra el fichero él mismo cuando aparece `lock-release` y borra `lock-ready` al cerrarlo. El test crea `lock-release` y espera, hasta 15 s, a que desaparezca `lock-ready`. Ya no mata a nadie.
- **Decisiones:**
  - Soltar el handle por señal de fichero en vez de matar el proceso. — sin el dev-lead; solo cambia el test, no lo que el usuario ve.
  - Dos asserts nuevos: el hijo tiene el fichero abierto antes del update y lo ha soltado al acabar. Si el `pwsh` hijo tarda más de 15 s, el test lo dice en vez de seguir sin bloqueo. — sin el dev-lead; solo afecta al test.

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | Reproducir: suite en la verificación de `Invoke-SddMerge.ps1` antes del fix | ❌ `EBUSY` en `appendFileSync` (log citado en §1) |
| 2 | Suite completa tras el fix, 5 veces seguidas | ✅ 5 de 5 OK |
| 3 | La misma suite en la verificación del merge del patch (`Invoke-SddMerge.ps1`) | la ejecuta el merge del cierre |

Validación diferida: 2026-10-18 · «Diferir: lo pruebo en los próximos merges con Invoke-SddMerge, a cargo del dev-lead» · disparador: próximos merges con Invoke-SddMerge, a cargo del dev-lead

## 5. Tiempo (ligero)

- Estimación: 0.25h
- Real: 0.4h

## Adendas

- 2026-10-18 — Validado en el smoke de la release 2.0.0: «Todo, lo uso a diario y funciona». Cierra la validación diferida.
