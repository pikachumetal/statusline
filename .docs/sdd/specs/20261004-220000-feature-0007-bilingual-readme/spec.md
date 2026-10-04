---
id: 20261004-220000-feature-0007-bilingual-readme
feature: 0007
title: README bilingüe
mode: full
profile: unattended
status: approved
created: 2026-10-05
author: Claude (unattended)
approvers:
  - role: dev-lead
    name: Àngel Delgado
    approved_at: null
---

# Spec — README bilingüe

## Capacidades

- Ninguna, porque docs: el README describe el producto, no cambia su comportamiento.

## Decisiones que he tomado yo — valida estas

Review de spec propuesta: ninguna — señales: ninguna · tamaño: ~80 líneas en 2 ficheros
- Mínimo razonable: ninguna — deja sin mirar por otro agente si la traducción conserva el sentido; lo comprueba la revisión final

1. Modo full y no lite: lite necesita la confirmación del dev-lead y el perfil es `unattended`.
2. Forma (regla 2 de la constitution, que la deja a esta task): `README.md` en castellano y `README.en.md` en inglés, con un enlace al otro idioma en la primera línea de cada uno. Descartado un fichero con dos secciones: duplica la longitud y el lector de cada idioma tiene que saltarse la mitad.
3. El README se pone al día con lo entregado desde la v1.0.0: el ejemplo sale del render real (icono de nivel en las ventanas, sub-bloques, marcador de ritmo, `$/h`) y las listas de L1 y L2 lo describen, más el `⚠` de un segmento que falla y el lanzador que elige el Node de proto por versión.
4. Los dos ficheros dicen lo mismo, sección por sección: Instalar, Actualizar, Orca y Test. Los comandos y el ejemplo son idénticos.
5. Al cerrar, la regla 2 de la constitution registra la forma elegida.

### Decisiones tomadas con el dev-lead

- Perfil `unattended` para la feature — «ok! dale unattended»

## Intent

El README solo está en castellano y su ejemplo es de la v1.0.0. Se quiere una versión en inglés para quien no lee castellano y que las dos describan el statusline de hoy.

## Scope

- Entra: `README.md` (al día) y `README.en.md` (nuevo); regla 2 de `constitution.md`.
- No entra: documentación de desarrollo (vive en `.docs/sdd/`), capturas de pantalla.

## Approach

Reescribir `README.md` con el ejemplo y las listas al día, y traducirlo a `README.en.md` con la misma estructura.

## Delta de comportamiento

Sin delta: no cambia ningún requisito.

## Enmiendas

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
| --- | --- | --- | --- |
| dev-lead | Claude (unattended) | 2026-10-05 | aprobada por el agente en `unattended` |
