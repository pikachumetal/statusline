---
id: 20261004-215710-patch-0017-suffix-c1
task: 0017
title: Patch — el saneado del sufijo deja pasar DEL y los C1
type: patch
solution: causa raíz
status: done
created: 2026-10-04
branch: chore/0017-suffix-c1
commit: 25ce726
---

# Patch 0017 — el saneado del sufijo deja pasar DEL y los C1

## Capacidades

- Modificadas: `input` — «Saneado del sufijo de ahorro» nombra los rangos que elimina.

## 1. Síntoma

Fila de deuda técnica, vista al ampliar los tests en la 0002: «El saneado de `.caveman-statusline-suffix` deja pasar `DEL` (`0x7F`) y los C1 (`0x80`–`0x9F`, entre ellos `0x9B`, CSI de un byte)». Medido: `'A\x7fB\x9bC'.replace(/[\x00-\x1f\x1b]/g, '')` conserva `0x7F` y `0x9B` (5 caracteres).

## 2. Causa raíz

`readSavingsSuffix` (`statusline.js`) filtra `[\x00-\x1f\x1b]`: los controles C0 (y `\x1b`, que ya está dentro de C0). No incluye `DEL` (`U+007F`) ni el bloque C1 (`U+0080`–`U+009F`), donde `U+009B` es un CSI de un carácter: una terminal que interpreta C1 empieza ahí una secuencia de escape. El fichero se lee como UTF-8, así que un C1 llega como `U+0080`–`U+009F` si viene codificado (`C2 9B`).

Reproducido en RED: con el sufijo `A\x7fB\u009b31mC\u0085D`, la L1 contiene caracteres en `[\x7f-\x9f]`.

## 3. Fix

- **Fichero(s)**: `statusline.js`, `statusline.test.js`
- **Cambio**: el filtro pasa a `[\x00-\x1f\x7f-\x9f]` (C0, `DEL` y C1).

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | RED: sufijo con `DEL`, `U+009B` y `U+0085` | ✅ falla con `AssertionError: sufijo sin DEL ni C1` |
| 2 | GREEN: `node statusline.test.js` | ✅ `statusline.test.js OK` |
| 3 | Ejecución real del filtro: `A\x7fB\u009b31mC\u0085D\x1b[31mX` | ✅ `AB31mCD[31mX` |

Validación diferida: 2026-10-04 · «ok! dale unattended» · disparador: smoke de la release 1.1.0, a cargo del dev-lead

## 5. Tiempo (ligero)

- Real: 0,1h

## 6. Delta de capacidad

### Capacidad: `input`

**MODIFIED — Saneado del sufijo de ahorro**
- GIVEN el fichero `.caveman-statusline-suffix` con caracteres de control o secuencias de escape
- WHEN el statusline lo lee
- THEN elimina los caracteres de control antes de pintarlo, de modo que un fichero externo no puede inyectar secuencias ANSI
- AND son caracteres de control los C0 (`U+0000`–`U+001F`, `ESC` incluido), `DEL` (`U+007F`) y los C1 (`U+0080`–`U+009F`, `U+009B` incluido): `A␡B<CSI>31mC` se pinta `AB31mC`
