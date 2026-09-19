# Método de estimación — statusline

El método del kit, sin cambios: el `plan.md` de cada task estima horas (con
rango), el `walkthrough.md` registra el tiempo real, y el log agregado calcula
el factor de calibración (ratio mediano real/estimado).

- **Fiabilidad:** la banda se calibra por proyecto desde la tercera muestra y
  es fiable a partir de unas 10 tasks. El ratio de otros proyectos no se trae aquí.
- **Dos poblaciones:** tasks y patches se calibran aparte. Un patch registra
  solo el tiempo real, sin estimación previa.
- **Desviación:** si el real se desvía más de un ±30 % del estimado, el
  walkthrough explica la causa.
- **Escala:** las tasks de este proyecto son pequeñas (un fichero, un segmento).
  Se estiman en horas con decimales, o en minutos si no llegan a la hora.

`estimation-log.md` **se genera**, no se escribe a mano. Lo regenera
`Build-EstimationLog.ps1`, del skill `sdd-templates` del kit, a partir del
bloque de tiempo de cada walkthrough y patch.
