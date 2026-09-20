# statusline

Statusline de dos líneas para Claude Code en Windows. Sin dependencias (Node + git).

```
EasyClaw  main 🌳 feat-x │ 🤖 Fable 5.1 (medium) │ 🗿 lite │ 🦥 full │ +156 -23
⏱️ 12m │ 🟡 █████░░░░░ 47% │ 5h ⏳ 1h30m ███░░░░░ 34% ↻23:20 │ 7d ███░░░░░ 38% │ 💰 $0.47
```

- L1: perfil (`🧪 nombre`, solo si `CLAUDE_CONFIG_DIR` no es el default), repo + branch (nerd font) + worktree, modelo (thinking), caveman, ponytail, velocity.
- L2: reloj de sesión, contexto (🟢 <20% 🟡 <70% 🔥 <90% 🚨), ventana 5h (tiempo, barra, reset), semanal, coste.
- Barras con gradiente truecolor por posición. Requiere terminal truecolor y nerd font.

## Instalar

```powershell
.\install.ps1                              # ~/.claude
.\install.ps1 -ConfigDir "$HOME\.claude-gco"
```

Copia `hooks/statusline.{js,cmd,test.js}` y muestra el bloque `statusLine` para `settings.json`.

Para actualizar, ejecuta el mismo comando sobre el mismo perfil: sobrescribe los ficheros y, si `settings.json` ya apunta al statusline, no pide pegar nada. Nunca modifica `settings.json`.

## Test

```
node statusline.test.js
```
