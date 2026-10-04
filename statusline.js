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
const SEVEN_DAYS_MS = 7 * 24 * 3600 * 1000;

// ---------- barras ----------
const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

// Color del bloque según su posición: verde -> amarillo -> rojo.
function gradientAt(t) {
    const g = [0, 200, 80], y = [220, 200, 0], r = [220, 40, 20];
    const [from, to, u] = t < 0.5 ? [g, y, t * 2] : [y, r, (t - 0.5) * 2];
    return rgb(...from.map((v, i) => Math.round(v + (to[i] - v) * u)));
}

// La celda de corte lleva fondo gris para que el sub-bloque no deje un hueco del color de la terminal.
const EIGHTHS = '▏▎▍▌▋▊▉';
const GRAY_BG = `${ESC}48;2;60;60;60m`;

const MARK = `${rgb(240, 240, 240)}┃${RESET}`;

// El marcador lleva de fondo el color que tendría su celda, para que el relleno se siga leyendo.
function bar(pct, width, pace = null) {
    const eighths = Math.round(clamp(pct) / 100 * width * 8);
    const full = Math.floor(eighths / 8), rest = eighths % 8;
    const mark = pace == null ? -1 : Math.min(width - 1, Math.floor(clamp(pace) / 100 * width));
    let out = '';
    for (let i = 0; i < width; i++) {
        if (i === mark) out += (i < full ? gradientAt(i / (width - 1)).replace('38;2', '48;2') : GRAY_BG) + MARK;
        else if (i < full) out += gradientAt(i / (width - 1)) + '█';
        else if (i === full && rest > 0) out += GRAY_BG + gradientAt(i / (width - 1)) + EIGHTHS[rest - 1] + RESET;
        else out += C.gray + '█';
    }
    return out + RESET;
}

function levelColor(pct) {
    if (pct < 20) return C.green;
    if (pct < 70) return C.yellow;
    if (pct < 90) return C.amber;
    return C.red;
}

function levelEmoji(pct) {
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

// Duraciones de varios días (ventana semanal): en horas solas serían ilegibles.
function fmtSpan(ms) {
    const hours = Math.floor(Math.max(0, ms) / 3600000);
    if (hours < 24) return fmtDuration(ms);
    return `${Math.floor(hours / 24)}d${String(hours % 24).padStart(2, '0')}h`;
}

// Un resets_at que no sea un epoch numérico se trata como ausente: pintar NaN
// sería pintar basura (constitution, regla 3).
const resetMs = (epochSeconds) => (Number.isFinite(epochSeconds) ? epochSeconds * 1000 : null);

function fmtClock(epochSeconds) {
    const d = new Date(epochSeconds * 1000);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ---------- entorno (git, flags, perfil) ----------
// Un plazo para todas las llamadas del refresco: con un timeout por llamada, un git lento
// sumaba hasta 6 s en cada refresco.
const GIT_BUDGET_MS = 2000;

function git(args, cwd, timeout = GIT_BUDGET_MS) {
    try {
        return execFileSync('git', ['-C', cwd, '--no-optional-locks', ...args], {
            encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'ignore'],
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

function readGit(data, run = git) {
    const cwd = projectDir(data);
    if (!cwd) return null;
    const deadline = Date.now() + GIT_BUDGET_MS;
    const call = (args) => {
        const left = deadline - Date.now();
        return left > 0 ? run(args, cwd, left) : null;
    };
    const paths = call(['rev-parse', '--path-format=absolute', '--show-toplevel', '--git-common-dir', '--git-dir']);
    if (!paths) return null;
    const branch = call(['symbolic-ref', '--short', 'HEAD']) || call(['rev-parse', '--short', 'HEAD']) || '?';
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
            // caveman 3.x escribe caveman/ultracave/megacave; los modos 2.x siguen en perfiles sin actualizar.
            caveman: readFlag(path.join(claudeDir, '.caveman-active'),
                ['caveman', 'ultracave', 'megacave',
                    'lite', 'full', 'ultra', 'wenyan-lite', 'wenyan', 'wenyan-full', 'wenyan-ultra', 'commit', 'review', 'compress']),
            ponytail: readFlag(path.join(claudeDir, '.ponytail-active'), ['lite', 'full', 'ultra', 'review']),
            savings: readSavingsSuffix(claudeDir),
        },
    };
}

// ---------- render ----------
function renderWhere(data, env) {
    const name = env.git ? env.git.repo : path.basename(projectDir(data));
    if (!name) return null;
    let out = `${BOLD}${C.orange}${name}${RESET}`;
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
    const where = renderWhere(data, env);
    if (where) parts.push(where);

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
    const reset = resetMs(five.resets_at);
    let s = `${levelEmoji(pct)} ${C.dim}5h${RESET}`;
    let pace = null;
    if (reset !== null) {
        const elapsed = Math.max(0, Math.min(FIVE_HOURS_MS, FIVE_HOURS_MS - (reset - now)));
        s += ` ⏳ ${fmtDuration(elapsed)}`;
        pace = elapsed / FIVE_HOURS_MS * 100;
    }
    s += ` ${bar(pct, USAGE_WIDTH, pace)} ${pctText(pct)}`;
    if (reset !== null) s += ` ${C.dim}↻${fmtClock(five.resets_at)}${RESET}`;
    return s;
}

// El ↻ del semanal es una cuenta atrás: la hora sola no dice de qué día es.
function renderSevenDay(week, now) {
    const pct = clamp(week.used_percentage);
    const reset = resetMs(week.resets_at);
    const left = reset === null ? null : Math.max(0, reset - now);
    const elapsed = left === null ? null : Math.max(0, Math.min(SEVEN_DAYS_MS, SEVEN_DAYS_MS - left));
    let s = `${levelEmoji(pct)} ${C.dim}7d${RESET}`;
    if (elapsed !== null) s += ` ⏳ ${fmtSpan(elapsed)}`;
    s += ` ${bar(pct, USAGE_WIDTH, elapsed === null ? null : elapsed / SEVEN_DAYS_MS * 100)} ${pctText(pct)}`;
    if (left !== null) s += ` ${C.dim}↻${fmtSpan(left)}${RESET}`;
    return s;
}

// Por debajo de 5 minutos el ritmo se dispara con la primera respuesta y no informa.
const MIN_RATE_MS = 5 * 60000;

function renderCost(cost) {
    const usd = Number.isFinite(cost?.total_cost_usd) ? cost.total_cost_usd : 0;
    const ms = cost?.total_duration_ms;
    let s = `💰 $${usd.toFixed(2)}`;
    if (Number.isFinite(ms) && ms >= MIN_RATE_MS && usd > 0) s += ` · $${(usd / (ms / 3600000)).toFixed(2)}/h`;
    return `${C.dim}${s}${RESET}`;
}

function renderLine2(data, now) {
    const parts = [`⏱️ ${fmtDuration(data.cost?.total_duration_ms || 0)}`];

    const ctx = clamp(data.context_window?.used_percentage);
    parts.push(`${levelEmoji(ctx)} ${bar(ctx, CONTEXT_WIDTH)} ${pctText(ctx)}`);

    if (data.rate_limits?.five_hour) parts.push(renderFiveHour(data.rate_limits.five_hour, now));

    if (data.rate_limits?.seven_day) parts.push(renderSevenDay(data.rate_limits.seven_day, now));

    parts.push(renderCost(data.cost));
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

module.exports = { render, bar, gitNames, readGit, gradientAt, GRAY_BG, RESET };
if (require.main === module) main();
