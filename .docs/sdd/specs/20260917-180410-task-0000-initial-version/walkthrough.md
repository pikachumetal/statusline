---
id: 20260917-180410-task-0000-initial-version
task: 0000
title: Walkthrough — versión inicial del statusline
spec: no existe (trabajo anterior a la adopción de SDD)
plan: no existe (trabajo anterior a la adopción de SDD)
status: done
created: 2026-09-20
---

# Walkthrough — versión inicial del statusline

Documento **retroactivo**. La versión inicial se hizo el 2026-09-17, antes de
adoptar SDD en este repo, sin spec ni plan. Este walkthrough se redacta el
2026-09-20, al cerrar la release v1.0.0, a partir del commit, del código, del
README y de lo que el usuario contó en la entrevista de la init. La fecha de la
carpeta es la del commit (UTC), no la de redacción. Lo que no se puede
reconstruir se dice, no se inventa.

## 1. Cambios realizados

Commit `8a7dff9` — `feat: statusline de dos líneas para Claude Code` (2026-09-17 20:04 +0200). Cinco ficheros nuevos:

- **`statusline.js`** (213 líneas). Lee el JSON de la sesión por stdin y escribe dos líneas ANSI en stdout.
  - L1: perfil, repo, branch, worktree, modelo y effort, modos caveman y ponytail, velocity.
  - L2: reloj de sesión, contexto con icono por umbral, ventana de 5h, ventana semanal y coste.
  - Barras con gradiente truecolor por posición; color del porcentaje por umbral.
  - Lectura endurecida de los ficheros flag de otros plugins (sin symlinks, máximo 64 bytes, whitelist).
  - `git` con `--no-optional-locks`, timeout de 2000 ms y stderr descartado.
  - `render` pura, separada del acceso al exterior (`readEnv`, `main`), para poder probarla sin mocks.
- **`statusline.test.js`**. Self-check con `assert` de la stdlib sobre `render` y `bar`.
- **`statusline.cmd`**. Lanzador para Windows. Usa el `node.exe` real de proto y no su shim, porque el shim inyecta a veces una línea NDJSON en stdout.
- **`install.ps1`**. Copia los tres ficheros a `hooks/` del perfil (`-ConfigDir`) y muestra el bloque `statusLine` para `settings.json`, sin modificarlo.
- **`README.md`**. Descripción, instalación y test.

Motivación, contada por el usuario en la entrevista de la init: sustituir a
[ccstatusline](https://github.com/sirmalloc/ccstatusline) porque hacían falta
segmentos muy específicos, y tener en un único panel el consumo y el estado de
la sesión, con soporte para varios perfiles (`~/.claude` y `~/.claude-gco`).

El comportamiento resultante está descrito, requisito a requisito, en
`capabilities/`: `input`, `session-state`, `usage`, `installation` y `output`.

## 2. Tiempo: estimado vs real

- Tipo: infra/tooling
- Estimación de implementación (del plan): — (no hubo plan)
- Esfuerzo real: — (no medido y no reconstruible: no hay registro de la sesión de trabajo en este repo; solo consta la hora del commit)
- Desviación: —
- Causa de la desviación: no aplica
- Review de spec: no

## 3. Desviaciones del plan

_No aplica._ No hubo plan.

## 4. Verificación

### 4.1 Builds

No hay build. `node statusline.test.js` → `statusline.test.js OK` (ejecutado por el agente sobre el commit `8a7dff9` al redactar este documento).

### 4.2 Smoke / tests

- Validado por el dev-lead: en uso diario en sus dos perfiles desde el 2026-09-17. La captura que aportó el 2026-09-20 para el patch `worktree-name` muestra el statusline funcionando en una sesión real.

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | Tests del commit inicial | ✅ verificado por el agente |
| 2 | Instalado y en uso en `~/.claude` y `~/.claude-gco` | ✅ reportado por el usuario; el agente comprobó el 2026-09-20 que las copias instaladas eran idénticas a las del commit |
| 3 | Nombre del worktree legible | ❌ salía el id interno de git. Corregido en el patch `worktree-name` |
| 4 | Bloque `statusLine` que muestra `install.ps1` | ❌ salía con la ruta vacía por un regex inválido. Corregido en el patch `installer-update` |

### 4.3 Residuales / deuda generada

Todo está ya en `roadmap.md`:

- `readGit` hace hasta 3 llamadas a `git` con 2 s de timeout cada una.
- Requisitos sin test (10 de 30 al cerrar la v1.0.0).
- Con stdin inválido la L1 empieza con un segmento vacío.
- `statusline.cmd` ordena las versiones de Node de proto por nombre, no por SemVer.

## 5. Aprendizajes

- Un fichero sin test puede llevar un bug desde el primer commit sin que nadie lo vea: `install.ps1` fallaba desde el día uno → principio «test primero» de `constitution.md` y action item A2 del acta de la v1.0.0.
- `render` pura y el acceso al exterior aparte es lo que permite probar sin mocks → «Separación que hay que conservar» de `architecture.md`.
- El JSON de Claude Code no siempre trae datos legibles (el id interno del worktree) → excepción a la regla 5 de `constitution.md`.
