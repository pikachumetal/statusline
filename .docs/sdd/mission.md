# Mission — statusline

## Por qué existe

Statusline propio para Claude Code que reúne en un único panel de dos líneas
el **consumo** (contexto, ventana de 5h, límite semanal, coste) y el **estado
de la sesión** (perfil, repo, branch, worktree, modelo y modos activos).

Nace como sustituto de [ccstatusline](https://github.com/sirmalloc/ccstatusline):
hacían falta segmentos muy específicos que no encajaban allí. ccstatusline queda
como referencia de consulta para ver cómo resuelve ciertos segmentos.

## Usuarios

Un único tipo de usuario: quien instala el statusline en su Claude Code. No hay roles.

- Hoy es de uso personal, con N perfiles vía `CLAUDE_CONFIG_DIR`
  (en el caso del autor: el default y `gco`).
- Está pensado para poder compartirse: otros deben poder instalarlo.

## Alcance

- **Plataforma:** Windows primero. Solo Windows tiene instalador (`install.ps1`)
  y soporte. `statusline.js` no debe depender de nada específico de Windows,
  para que en macOS o Linux se pueda configurar a mano.
- **Terminal:** truecolor y nerd font son requisito duro, documentado en el
  README. Sin modo alternativo ni autodetección.
- **Producto:** se queda como está. Los segmentos nuevos y la configurabilidad
  son módulos futuros sin compromiso (ver `roadmap.md`).

## Glosario

- **Perfil:** un directorio de configuración de Claude Code, seleccionado con
  `CLAUDE_CONFIG_DIR`. El default es `~/.claude`.
- **Segmento:** cada pieza de información que pinta el statusline
  (modelo, contexto, coste…).
- **L1 / L2:** primera línea (estado de la sesión) y segunda línea (consumo).
- **Ventana de 5h / semanal:** las dos cuotas de uso de Claude Code que se
  muestran con barra y porcentaje.
- **Flag:** fichero pequeño que otro plugin (caveman, ponytail) deja en el
  perfil para indicar su modo activo. El statusline solo lo lee.
- **Velocity:** líneas añadidas y eliminadas en la sesión (`+156 -23`).
