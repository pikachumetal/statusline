---
id: 20261004-214415-feature-0002-untested-requirements
feature: 0002
title: Tests de los requisitos sin cobertura
mode: full
profile: unattended
status: approved
created: 2026-10-04
author: Claude (unattended)
approvers:
  - role: dev-lead
    name: Àngel Delgado
    approved_at: null
---

# Spec — Tests de los requisitos sin cobertura

## Capacidades

- Ninguna, porque herramientas: solo se añaden tests; el comportamiento no cambia. Las líneas `> Cobertura:` de los requisitos cubiertos se actualizan al cerrar.

## Decisiones que he tomado yo — valida estas

Review de spec propuesta: ninguna — señales: ninguna · tamaño: ~120 líneas de test en 1 fichero
- Mínimo razonable: ninguna — deja sin mirar por otro agente qué requisito queda sin cubrir; lo comprueba el recuento de cierre

1. Modo full y no lite: lite necesita la confirmación del dev-lead y el perfil es `unattended`.
2. Recuento del 2026-10-04 (la fila hablaba de 10 requisitos al cerrar la v1.0.0): hoy los cubren ya «Stdin vacío o inválido» (0006), «Lanzador» (0004) y «Separador de segmentos» (0003 y 0006). Quedan sin test o parciales: «Lectura de ficheros flag», «Saneado del sufijo de ahorro», «Directorio del proyecto», «Campo ausente en el JSON» (`input`); «Perfil», «Ubicación en detached HEAD», «Valor de un flag» (`session-state`); «Color del porcentaje» (`usage`); «Color» e «Iconos» (`output`); «Wrapper de Orca» (`installation`).
3. Los requisitos de `readEnv` (flags, sufijo, perfil) se prueban lanzando `statusline.js` con un `CLAUDE_CONFIG_DIR` temporal: `readEnv` no es pura. El detached HEAD, con el ejecutor de `git` simulado de la 0001.
4. El symlink del hardening se prueba solo si el sistema deja crearlo (en Windows sin modo desarrollador `symlinkSync` falla con `EPERM`); si no, se salta con constancia en la salida del test.
5. El wrapper de Orca se prueba con un `USERPROFILE` y un `TEMP` temporales y un hook de Orca falso que guarda lo que recibe: solo en Windows.
6. Un test que descubra un fallo no lo arregla esta feature: el fallo va a la deuda técnica y el test se deja en rojo fuera de la suite, con constancia en el walkthrough.
7. «Iconos» (sin nerd font se ve un símbolo roto) y «Campo ausente en el JSON» no tienen nada más que probar: el primero es un requisito del terminal y el segundo lo cubren ya los tests de ausencia de las 0006 y 0016. Se marcan con su cobertura real al cerrar.
8. `Merge-CapabilityDelta.ps1` borra la línea `> Cobertura:` de cada requisito que fusiona; 16 requisitos se han quedado sin ella hoy. Al cerrar se repone en los que esta feature toca y se apunta para el ticket del kit.

### Decisiones tomadas con el dev-lead

- Perfil `unattended` para la feature — «ok! dale unattended»

## Intent

Las capacidades marcan qué requisitos no tienen test: un cambio puede romperlos sin que `node statusline.test.js` lo detecte. El hardening de los ficheros flag y el saneado del sufijo son seguridad (regla 3, principio 4), y no tienen ninguno.

## Scope

- Entra: tests en `statusline.test.js` de los requisitos de la decisión 2; líneas `> Cobertura:` de las capacidades.
- No entra: cambiar comportamiento; arreglar lo que los tests destapen.

## Approach

Un test por THEN de cada requisito, con `render` cuando es pura y con `statusline.js`/`statusline-orca.cmd` lanzados cuando depende del entorno.

## Delta de comportamiento

Sin delta: no cambia ningún requisito.

## Enmiendas

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
| --- | --- | --- | --- |
| dev-lead | Claude (unattended) | 2026-10-04 | aprobada por el agente en `unattended` |
