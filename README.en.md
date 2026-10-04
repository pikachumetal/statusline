# statusline

[Castellano](README.md) · **English**

Two-line statusline for Claude Code on Windows. No dependencies: just Node and `git`.

```
EasyClaw  main 🌳 feat-x │ 🤖 Fable 5.1 (medium) │ 🗿 caveman │ 🦥 full │ +156 -23
⏱️ 12m │ 🟡 ████▊█████ 47% │ 🟡 5h ⏳ 1h23m ██┃█████ 34% ↻17:37 │ 🟡 7d ⏳ 6d00h ██████┃█ 38% ↻1d00h │ 💰 $0.47 · $2.35/h
```

## What it shows

- **L1**: profile (`🧪 name`, only when `CLAUDE_CONFIG_DIR` is not the default), repo, branch and worktree, model and effort, caveman and ponytail modes, and lines added and removed in the session.
- **L2**: session clock, context, 5-hour window, weekly window and cost.
- **Level icon** on the context and on both windows: 🟢 below 20 %, 🟡 below 70 %, 🔥 below 90 % and 🚨 from 90 %. The percentage changes colour at the same thresholds.
- **Bars** with a truecolor gradient by position. The cut-off cell is drawn with a partial block (`▏▎▍▌▋▊▉`), so the bar moves in eighths of a cell.
- **Pace marker** `┃` on the 5-hour and weekly bars: where you would be if you spent the quota at a steady rate until the reset. If the fill goes past the marker, the quota runs out before the window does.
- **Reset** `↻`: local time on the 5-hour window and a countdown on the weekly one.
- **Cost per hour** (`$/h`) from 5 minutes into the session.
- **Failures**: a segment that fails to render leaves a grey `⚠` in its place and the rest is drawn as usual. Missing data is not a failure: its segment is left out.

It needs a truecolor terminal and a Nerd Font (the branch icon is the `U+E0A0` glyph).

## Install

```powershell
.\install.ps1                              # ~/.claude
.\install.ps1 -ConfigDir "$HOME\.claude-gco"
```

Copies `statusline.js`, `statusline.cmd`, `statusline-orca.cmd` and `statusline.test.js` to the profile's `hooks\` folder and prints the `statusLine` block to paste into `settings.json`. It never modifies `settings.json`.

`statusline.cmd` runs the `node.exe` of the highest version installed with proto, by SemVer, not its shim. Without proto, it uses `node` from the PATH.

## Update

Run the same command on the same profile: it overwrites the files and, if `settings.json` already points to the statusline, it doesn't ask you to paste anything.

## Orca

With Orca installed (`~\.orca\agent-hooks\claude-statusline.cmd`), the block points to `statusline-orca.cmd`: it draws this statusline and forwards the same JSON to Orca, which reads `rate_limits` without drawing anything.

## Test

```
node statusline.test.js
```
