---
release: v1.0.0
title: statusline v1.0.0 — consumo y estado de la sesión de Claude Code, de un vistazo
created: 2026-09-20
---

# statusline v1.0.0 — consumo y estado de la sesión de Claude Code, de un vistazo

*20 de septiembre de 2026*

## Resumen

Primera versión publicada. Con ella ves en dos líneas, debajo del prompt de
Claude Code, dónde estás trabajando y cuánto llevas consumido, sin tener que
preguntarlo ni abrir otra ventana.

## Novedades

- **Para saber dónde estás**: la primera línea muestra el perfil de Claude Code (si no es el de por defecto), el proyecto, la rama y, si trabajas en una copia de trabajo aparte, su nombre. También el modelo, su nivel de esfuerzo y los modos de respuesta activos.
- **Para no quedarte sin cuota a mitad de tarea**: la segunda línea muestra el tiempo de sesión, cuánto contexto llevas usado, el consumo de la ventana de 5 horas (con la hora a la que se renueva) y el semanal, y el coste. El color cambia según te acercas al límite.
- **Para quien usa varios perfiles**: el instalador admite cualquier perfil, y se ejecuta igual la primera vez que para actualizar. Si el perfil ya estaba configurado, te lo dice y no te pide tocar nada.
- **Para quien trabaja con varias copias de trabajo**: el nombre que se muestra es el de la carpeta, legible. Antes podía aparecer un identificador largo e incomprensible.

## Problemas conocidos

- Solo hay instalador para Windows. En macOS y Linux el programa funciona, pero hay que configurarlo a mano.
- Hace falta un terminal con color verdadero y una fuente con iconos (nerd font). Sin ellos se ven símbolos rotos.
- Hace falta git 2.31 o posterior.
- En un proyecto donde git responde muy despacio, el statusline puede tardar varios segundos en refrescarse.

## Fuera de alcance de esta entrega

- Elegir qué datos se muestran, en qué orden y en cuántas líneas.
- Iconos de alerta para las cuotas de 5 horas y semanal (hoy solo cambia el color).
- Documentación en inglés.

## Próximos pasos

- Por nuestra parte: decidir qué entra en la siguiente versión a partir de la lista anterior.
- Por vuestra parte: para actualizar una instalación existente, ejecutar `.\install.ps1` otra vez sobre el mismo perfil.
