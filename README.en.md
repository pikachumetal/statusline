# statusline

[Castellano](README.md) · **English**

Statusline for Claude Code on Windows: two lines by default, configurable per profile. No dependencies: just Node and `git`.

```
EasyClaw  main 🌳 feat-x │ 🤖 Fable 5.1 (medium) │ 🗿 caveman │ 🦥 full │ +156 -23
⏱️ 12m │ 🟡 ████▊█████ 47% │ 🟡 5h ⏳ 1h23m ██┃█████ 34% ↻17:37 │ 🟡 7d ⏳ 6d00h ██████┃█ 38% ↻1d00h │ 💰 $0.47 · $2.35/h
```

## What it shows

- **L1** (default): profile (`🧪 name`, only when `CLAUDE_CONFIG_DIR` is not the default), repo, branch and worktree, model and effort, caveman and ponytail modes, and lines added and removed in the session.
- **L2** (default): session clock, context, 5-hour window, weekly window and cost.
- **Level icon** on the context and on both windows: 🟢 below 20 %, 🟡 below 70 %, 🔥 below 90 % and 🚨 from 90 %. The percentage changes color at the same thresholds.
- **Bars** with a truecolor gradient by position. The cut-off cell is drawn with a partial block (`▏▎▍▌▋▊▉`), so the bar moves in eighths of a cell.
- **Pace marker** `┃` on the 5-hour and weekly bars: where you would be if you spent the quota at a steady rate until the reset. If the fill goes past the marker and you keep that pace, the quota runs out before the window does.
- **Reset** `↻`: local time on the 5-hour window and a countdown on the weekly one.
- **Cost per hour** (`$/h`) from 5 minutes into the session, when the cost is above 0.
- **Failures**: a segment that fails to render leaves a gray `⚠` in its place and the rest is drawn as usual. Missing data is not a failure: its segment is left out.

It needs a truecolor terminal and a Nerd Font (the branch icon is the `U+E0A0` glyph).

## Configure the lines

Each profile can have its own `statusline.json` next to `settings.json`: in `CLAUDE_CONFIG_DIR` or, without that variable, in `~/.claude`. It sets which segments are drawn, in what order and on how many lines:

```json
{
  "lines": [
    ["duration", "profile", "where", "velocity"],
    ["context", "five_hour", "seven_day"]
  ]
}
```

Each inner list is a line, and its names are drawn in that order. Names are case-sensitive:

| Name | Draws |
| --- | --- |
| `profile` | profile `🧪 name` |
| `where` | repo, branch, git marks and worktree |
| `model` | model and effort |
| `caveman` | caveman mode and savings |
| `ponytail` | ponytail mode |
| `velocity` | lines added and removed |
| `duration` | session clock |
| `context` | context |
| `five_hour` | 5-hour window |
| `seven_day` | weekly window |
| `cost` | cost and `$/h` |

- Without the file, the layout is the usual one: the two lines above.
- A segment with no data is left out, and a line that ends up empty is not drawn. A repeated name is drawn each time.
- An unknown name draws a gray `⚠` in its place.
- An invalid file draws the usual layout with a gray `⚠` at the end of L1. It is invalid when:
  - it is not JSON;
  - `lines` is not a list of lines with at least one name each;
  - it is larger than 4096 bytes;
  - it is a symlink;
  - it is not a file (a directory) or cannot be read.
- Keys other than `lines` are ignored. A UTF-8 BOM at the start is accepted.
- The installer never creates or touches `statusline.json`.

## Install

```powershell
.\install.ps1                              # ~/.claude
.\install.ps1 -ConfigDir "$HOME\.claude-gco"
```

Copies `statusline.js`, `statusline.cmd`, `statusline-orca.cmd` and `statusline.test.js` to the profile's `hooks\` folder and prints the `statusLine` block to paste into `settings.json`. The installer never edits `settings.json` itself; the `claude` CLI, when it installs the controls mod, does register the plugin in the profile's settings.

`statusline.cmd` runs the `node.exe` of the highest version installed with proto, by SemVer, not its shim. Without proto, it uses `node` from the PATH.

## Update

Run the same command on the same profile: it overwrites the files and, if `settings.json` already points to the statusline, it does not ask you to paste anything.

## Orca

With Orca installed (`~\.orca\agent-hooks\claude-statusline.cmd`), the block points to `statusline-orca.cmd`: it draws this statusline, forwards the same JSON to Orca and discards its output.

## Controls mod

With Claude Code 2.1.302 or later, `install.ps1` also installs a mod that draws a clickable row above the prompt. Claude Code's hint line stays as it is, with its pills (`2 shells`) clickable. While a survey takes that spot, the row is not drawn:

```
🤖 Opus 5.5 (medium)  🗿 caveman  🦥 full  [passed]  Board
```

- **Selectors**: clicking the model, the effort, caveman or ponytail opens its options and hides the rest of the row; clicking an option applies it with the same command you would type (`/model`, `/effort`, `/caveman:caveman`, `/ponytail:ponytail`). `✕` closes without changing anything.
- **Tests**: `[passed]` in green or `[failed]` in red, from the session's last test command.
- **Board** opens ponytail's project board.

Notes:

- `/model` and `/effort` save the chosen value as the default for new sessions: Claude Code does that.
- Claude Code reads the mod from the clone's `mod/` folder. If you move or delete the clone, the mod stops loading until you run `install.ps1` again from the new path; switching branches in the clone changes the mod for every profile. To update it: `git pull` and `/reload-plugins`.
- Without the `claude` CLI on the PATH, the installer says so and gives the two commands to install it by hand.
- Hide ponytail's band above the prompt with `/ponytail band off`.
- The model, effort and modes also show in the status line; to remove them from there, leave `model`, `caveman` and `ponytail` out of `statusline.json`. The cost is only in the status line (`cost`).

## Test

```
node statusline.test.js
claude plugin test mod
```
