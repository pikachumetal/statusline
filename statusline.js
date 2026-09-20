'use strict';
// Statusline de Claude Code: dos líneas, emojis + nerd font, barras con gradiente truecolor.
// Lee el JSON de stdin, escribe ANSI en stdout. Sin dependencias.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ESC = '\x1b[';
const RESET = `${ESC}0m`;
const BOLD = `${ESC}1m`;
const rgb = (r, g, b) => `${ESC}38;2;${r};${g};${b}m`;
const C = {
    orange: rgb(217, 119, 87),
    green: rgb(80, 200, 120),
    yellow: rgb(220, 200, 0),
    amber: rgb(255, 140, 0),
    red: rgb(220, 60, 40),
    magenta: rgb(200, 120, 220),
    gray: rgb(60, 60, 60),
    dim: rgb(130, 130, 130),
};
const SEP = ` ${C.gray}│${RESET} `;
const BRANCH_ICON = '';
const CONTEXT_WIDTH = 10;
const USAGE_WIDTH = 8;
const FIVE_HOURS_MS = 5 * 3600 * 1000;

// ---------- barras ----------
const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

// Color del bloque según su posición: verde -> amarillo -> rojo.
function gradientAt(t) {
    const g = [0, 200, 80], y = [220, 200, 0], r = [220, 40, 20];
    const [from, to, u] = t < 0.5 ? [g, y, t * 2] : [y, r, (t - 0.5) * 2];
    return rgb(...from.map((v, i) => Math.round(v + (to[i] - v) * u)));
}

function bar(pct, width) {
    const filled = Math.round(clamp(pct) / 100 * width);
    let out = '';
    for (let i = 0; i < width; i++) out += (i < filled ? gradientAt(i / (width - 1)) : C.gray) + '█';
    return out + RESET;
}

function levelColor(pct) {
    if (pct < 20) return C.green;
    if (pct < 70) return C.yellow;
    if (pct < 90) return C.amber;
    return C.red;
}

function contextEmoji(pct) {
    if (pct < 20) return '🟢';
    if (pct < 70) return '🟡';
    if (pct < 90) return '🔥';
    return '🚨';
}

const pctText = (pct) => `${levelColor(pct)}${Math.round(pct)}%${RESET}`;

// ---------- formato ----------
function fmtDuration(ms) {
    const mins = Math.max(0, Math.round(ms / 60000));
    const h = Math.floor(mins / 60), m = mins % 60;
    return h > 0 ? `${h}h${String(m).padStart(2, '0')}m` : `${m}m`;
}

function fmtClock(epochSeconds) {
    const d = new Date(epochSeconds * 1000);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ---------- entorno (git, flags, perfil) ----------
function git(args, cwd) {
    try {
        return execFileSync('git', ['-C', cwd, '--no-optional-locks', ...args], {
            encoding: 'utf8', timeout: 2000, stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
    } catch { return null; }
}

// project_dir es donde arrancó Claude Code; current_dir sigue al cwd de la shell y baila.
const projectDir = (data) => data.workspace?.project_dir || data.workspace?.current_dir || data.cwd || '';

// Nombres legibles a partir de las rutas absolutas de git. En un worktree enlazado git-dir cuelga
// de common-dir (.git/worktrees/<id>); ese <id> interno no es el nombre de la carpeta si el worktree
// se movió tras crearse, y el JSON de Claude Code manda ese <id>. Por eso aquí manda git.
function gitNames(top, commonDir, gitDir) {
    const common = path.resolve(commonDir);
    const repoRoot = path.basename(common) === '.git' ? path.dirname(common) : common;
    const linked = path.resolve(gitDir) !== common;
    return { repo: path.basename(repoRoot).replace(/\.git$/, ''), worktree: linked ? path.basename(top) : null };
}

function readGit(data) {
    const cwd = projectDir(data);
    if (!cwd) return null;
    const paths = git(['rev-parse', '--path-format=absolute', '--show-toplevel', '--git-common-dir', '--git-dir'], cwd);
    if (!paths) return null;
    const branch = git(['symbolic-ref', '--short', 'HEAD'], cwd) || git(['rev-parse', '--short', 'HEAD'], cwd) || '?';
    return { ...gitNames(...paths.split(/\r?\n/)), branch };
}

// Mismo hardening que caveman-badge.js: sin symlinks, máx 64 bytes, whitelist.
function readSmallFile(file) {
    const st = fs.lstatSync(file);
    if (!st.isFile() || st.isSymbolicLink() || st.size > 64) return null;
    return fs.readFileSync(file, 'utf8');
}

function readFlag(file, valid) {
    try {
        const raw = readSmallFile(file);
        if (raw === null) return null;
        const mode = raw.split('\n')[0].trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (mode === '') return 'full';
        return valid.includes(mode) && mode !== 'off' ? mode : null;
    } catch { return null; }
}

function readSavingsSuffix(claudeDir) {
    if (process.env.CAVEMAN_STATUSLINE_SAVINGS === '0') return null;
    try {
        const raw = readSmallFile(path.join(claudeDir, '.caveman-statusline-suffix'));
        if (raw === null) return null;
        return raw.trimEnd().replace(/[\x00-\x1f\x1b]/g, '') || null;
    } catch { return null; }
}

function readEnv(data) {
    const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
    const profile = process.env.CLAUDE_CONFIG_DIR ? path.basename(process.env.CLAUDE_CONFIG_DIR) : null;
    return {
        git: readGit(data),
        profile: profile && profile !== '.claude' ? profile : null,
        flags: {
            caveman: readFlag(path.join(claudeDir, '.caveman-active'),
                ['lite', 'full', 'ultra', 'wenyan-lite', 'wenyan', 'wenyan-full', 'wenyan-ultra', 'commit', 'review', 'compress']),
            ponytail: readFlag(path.join(claudeDir, '.ponytail-active'), ['lite', 'full', 'ultra', 'review']),
            savings: readSavingsSuffix(claudeDir),
        },
    };
}

// ---------- render ----------
function renderWhere(data, env) {
    let out = `${BOLD}${C.orange}${env.git ? env.git.repo : path.basename(projectDir(data))}${RESET}`;
    if (!env.git) return out;
    out += ` ${C.green}${BRANCH_ICON} ${env.git.branch}${RESET}`;
    if (env.git.worktree) out += ` 🌳 ${env.git.worktree}`;
    return out;
}

// Velocity viene de cost, no de git: se muestra siempre que haya cambios.
function renderVelocity(data) {
    const add = data.cost?.total_lines_added || 0, del = data.cost?.total_lines_removed || 0;
    if (!add && !del) return null;
    return `${C.green}+${add}${RESET} ${C.red}-${del}${RESET}`;
}

function renderLine1(data, env) {
    const parts = [];
    if (env.profile) parts.push(`${C.magenta}🧪 ${env.profile}${RESET}`);
    parts.push(renderWhere(data, env));

    let model = `${C.magenta}🤖 ${data.model?.display_name || '?'}${RESET}`;
    if (data.effort?.level) model += ` ${C.dim}(${data.effort.level})${RESET}`;
    parts.push(model);

    if (env.flags.caveman) {
        const savings = env.flags.savings ? ` ${C.dim}${env.flags.savings}${RESET}` : '';
        parts.push(`🗿 ${env.flags.caveman}${savings}`);
    }
    if (env.flags.ponytail) parts.push(`🦥 ${env.flags.ponytail}`);
    const velocity = renderVelocity(data);
    if (velocity) parts.push(velocity);
    return parts.join(SEP);
}

function renderFiveHour(five, now) {
    const pct = clamp(five.used_percentage);
    let s = `${C.dim}5h${RESET}`;
    if (five.resets_at) {
        const elapsed = FIVE_HOURS_MS - (five.resets_at * 1000 - now);
        s += ` ⏳ ${fmtDuration(Math.max(0, Math.min(FIVE_HOURS_MS, elapsed)))}`;
    }
    s += ` ${bar(pct, USAGE_WIDTH)} ${pctText(pct)}`;
    if (five.resets_at) s += ` ${C.dim}↻${fmtClock(five.resets_at)}${RESET}`;
    return s;
}

function renderLine2(data, now) {
    const parts = [`⏱️ ${fmtDuration(data.cost?.total_duration_ms || 0)}`];

    const ctx = clamp(data.context_window?.used_percentage);
    parts.push(`${contextEmoji(ctx)} ${bar(ctx, CONTEXT_WIDTH)} ${pctText(ctx)}`);

    if (data.rate_limits?.five_hour) parts.push(renderFiveHour(data.rate_limits.five_hour, now));

    const week = data.rate_limits?.seven_day;
    if (week) {
        const pct = clamp(week.used_percentage);
        parts.push(`${C.dim}7d${RESET} ${bar(pct, USAGE_WIDTH)} ${pctText(pct)}`);
    }

    parts.push(`${C.dim}💰 $${(data.cost?.total_cost_usd || 0).toFixed(2)}${RESET}`);
    return parts.join(SEP);
}

function render(data, env, now = Date.now()) {
    return `${renderLine1(data, env)}\n${renderLine2(data, now)}`;
}

function main() {
    let data = {};
    try { data = JSON.parse(fs.readFileSync(0, 'utf8')); } catch { /* stdin vacío o inválido: render con defaults */ }
    process.stdout.write(render(data, readEnv(data)));
}

module.exports = { render, bar, gitNames };
if (require.main === module) main();
