---
id: 20261004-152728-feature-0001-git-time-budget
feature: 0001
title: Presupuesto de tiempo de git y del render
mode: full
profile: unattended
status: done
created: 2026-10-04
author: Claude (unattended)
approvers:
  - role: dev-lead
    name: Àngel Delgado
    approved_at: null
---

# Spec — Presupuesto de tiempo de git y del render

## Capacidades

- Modificadas: `input` — «Consulta a git»: las llamadas de un refresco comparten un presupuesto de 2000 ms.

## Decisiones que he tomado yo — valida estas

Review de spec propuesta: ninguna — señales: MODIFIED («Consulta a git» de `input`) · tamaño: ~30 líneas en 2 ficheros y 3 docs
- Mínimo razonable: ninguna — deja sin mirar por otro agente si el presupuesto cambia algo que se ve; lo comprueba el repaso de coherencia

1. Modo full y no lite: lite necesita la confirmación del dev-lead y el perfil es `unattended`.
2. Presupuesto compartido en vez de una sola llamada a `git`: probado en un repo temporal, `rev-parse` no da en una llamada las rutas, la rama y el sha corto (`--short HEAD --abbrev-ref HEAD` falla con «Needed a single revision»), y con `HEAD` sin commits falla entera. Las llamadas siguen siendo las de hoy; lo que cambia es que se reparten 2000 ms en total.
3. Cifra del presupuesto: 2000 ms para todo `git` de un refresco (el timeout de una llamada de hoy), y el statusline completo, de arranque a salida, por debajo de 3000 ms en este repo. La constitution (regla 3) dejaba la cifra pendiente «hasta que exista un test que lo mida»: este es ese test.
4. Con el presupuesto agotado, la llamada no se lanza y devuelve vacío: el segmento degrada como hoy con un timeout (sin repo, o rama `?`).
5. `readGit` recibe el ejecutor de `git` como parámetro opcional y se exporta, para que el test mida el presupuesto con un `git` lento simulado. Sigue siendo la única función que habla con `git`.
6. Al aprobar, se actualizan la regla 3 de `constitution.md`, `tech-stack.md` y `architecture.md` (el valor vive en la capacidad; los docs la enlazan).
7. La 0012 (estado de git) ya no espera a una «sola llamada»: entrará en este mismo presupuesto.

### Decisiones tomadas con el dev-lead

- Perfil `unattended` para la feature — «VALE, LANZA EL SIGUIENTE UNATTENDED»

## Intent

`readGit` hace hasta 3 llamadas a `git`, cada una con 2 s de timeout: con un `git` lento (un antivirus, un disco de red) el statusline puede tardar 6 s en cada refresco. Se quiere un tope de 2 s para todo `git` y un test que mida el render completo.

## Scope

- Entra: `git()` y `readGit()` en `statusline.js`; tests en `statusline.test.js`; regla 3 de `constitution.md`, `tech-stack.md` y `architecture.md`.
- No entra: cambiar qué se le pregunta a `git`, el estado de git (0012).

## Approach

`readGit` fija un plazo al empezar. Cada llamada a `git` recibe como timeout lo que queda del plazo; si no queda, no se lanza.

## Delta de comportamiento

### Capacidad: `input`

**MODIFIED — Consulta a git** (antes: "cada llamada … tiene un timeout de 2000 ms")

- GIVEN un directorio de proyecto
- WHEN el statusline consulta `git`
- THEN cada llamada usa `--no-optional-locks` y descarta stderr
- AND todas las llamadas de un refresco comparten un presupuesto de 2000 ms: cada una tiene como timeout lo que queda, y si no queda nada no se lanza
- AND con un `git` que tarda 1500 ms en dar las rutas y no responde a lo demás, la consulta entera acaba en 2000 ms o menos, no en 5500 ms
- AND si `git` no existe, falla, agota el presupuesto o el directorio no es un repo, la consulta devuelve vacío y no se propaga ningún error
- AND el statusline completo, lanzado en este repo, termina en menos de 3000 ms

## Enmiendas

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
| --- | --- | --- | --- |
| dev-lead | Claude (unattended) | 2026-10-04 | aprobada por el agente en `unattended` |
