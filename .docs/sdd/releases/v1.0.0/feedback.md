---
release: v1.0.0
title: Acta de release — v1.0.0
created: 2026-09-20
source: sin sesión de feedback
---

# Acta de release — v1.0.0 (2026-09-20)

Fuente: no hubo demo ni reunión. La release documenta lo hecho hasta la fecha;
el único usuario es el autor.

## 1. Inventario y triage

_Ninguno._ No hay peticiones que triar.

## 2. Cambios de requisito detectados

- **Regla 5 de `constitution.md` («el stdin manda»)**: el patch `worktree-name` introdujo una excepción, decidida por el usuario. Para el nombre del worktree manda `git`, porque el JSON trae el id interno de git. Ya está reflejado en `constitution.md`, `input.md` y `session-state.md`.
- **Capacidad `installation`**: el patch `installer-update` añadió el requisito «Update sobre una instalación existente», pedido por el usuario al abrir el patch. Ya está reflejado en `installation.md`.

## 3. Retro

- **Agregado de la release**: 2 patches, 0.8 h reales (0.5 h + 0.3 h, ambas aproximadas). Sin estimado: los patches solo registran tiempo real. Ninguna task con estimación, así que todavía no hay ratio de calibración.
- **Alcance sin registro de tiempo**: la versión inicial (commit `8a7dff9`) es anterior a la adopción de SDD. A petición del usuario se documentó con un [walkthrough retroactivo](../../specs/20260917-180410-task-0000-initial-version/walkthrough.md), sin spec ni plan. Su tiempo real no se midió y no es reconstruible, así que `Build-EstimationLog.ps1` excluye esa fila del log (avisa de ello al ejecutarse). Se prefirió el hueco a un número inventado, que habría contaminado la calibración. La init SDD y las capacidades no son tasks y tampoco tienen registro de tiempo.
- **Capacidades escritas a posteriori**: las cuatro primeras se volcaron desde el código tras la init. Al revisarlas antes de cerrar la release se detectó una quinta que faltaba, `output` (dos líneas, separador, color, iconos), y un detalle sin describir en `usage` (el redondeo de los bloques de una barra).
- **Comprobación de los action items de la release anterior**: no aplica. Es la primera release.
- **Smoke**: 2026-09-20. `node statusline.test.js` en verde; lanzador real de los dos perfiles instalados (`~/.claude`, `~/.claude-gco`) ejecutado con el JSON de un worktree real; instalación limpia en carpeta temporal. 1 hallazgo: el bug de `install.ps1`, encontrado al reinstalar tras el primer patch y corregido dentro de esta misma release.
- **Qué funcionó**:
  - Escribir las capacidades con la marca de cobertura de tests hizo visible que `install.ps1` no tenía ninguno, antes de que su bug apareciera.
  - Reproducir cada bug con datos reales (el JSON de la captura, los worktrees del usuario) antes de tocar código: los dos fixes salieron a la primera.
  - Comparar las copias instaladas con la versión anterior del repo antes de sobrescribirlas.
- **Qué corregir**:
  - El bug de `install.ps1` estaba desde el primer commit y nadie lo vio: el instalador no tenía test y su error no era terminante.
  - En el primer patch se usó `git add -A` y entró en el commit un fichero sin decidir (`.claude/settings.json`). Se corrigió con un amend antes de publicar.
  - En dos ocasiones el agente dio por buena una decisión que el usuario no había respondido (el `package.json` en la init y la versión de esta release).
- **Action items nuevos**:
  - [A1] Los commits se preparan añadiendo rutas explícitas, nunca `git add -A`. Se verifica: ningún commit de la próxima release incluye ficheros ajenos a su patch o task (revisión de `git show --stat`).
  - [A2] Dar test a los requisitos marcados «sin test» en las capacidades, empezando por los de `input`. Se verifica: el número de requisitos con `Cobertura: sin test` baja respecto a los 10 actuales (de 30 requisitos).
  - [A3] Una pregunta sin respuesta del usuario se vuelve a plantear; no se resuelve con la recomendación del agente. Se verifica: el acta de la próxima release no registra ninguna decisión asumida.
