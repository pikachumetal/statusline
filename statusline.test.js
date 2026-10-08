'use strict';
// Self-check del statusline: node hooks/statusline.test.js
const assert = require('assert');
const { render, bar, gitNames, readGit, parseStatus, gradientAt, GRAY_BG, RESET } = require('./statusline.js');

const NOW = Date.UTC(2026, 8, 17, 12, 0, 0);
const fixture = {
    model: { display_name: 'Fable 5.1' },
    effort: { level: 'medium' },
    workspace: { current_dir: 'C:\\Users\\pikac\\.claude' },
    context_window: { used_percentage: 47 },
    cost: { total_cost_usd: 0.47, total_duration_ms: 12 * 60000, total_lines_added: 156, total_lines_removed: 23 },
    rate_limits: {
        five_hour: { used_percentage: 34, resets_at: NOW / 1000 + 3 * 3600 + 37 * 60 },
        seven_day: { used_percentage: 38, resets_at: NOW / 1000 + 86400 },
    },
};
const env = { flags: { caveman: 'lite', ponytail: 'full' }, git: null, profile: null };

const out = render(fixture, env, NOW);
const [l1, l2] = out.split('\n');
assert.strictEqual(out.split('\n').length, 2, 'dos líneas');
for (const s of ['.claude', '+156', '-23', 'Fable 5.1', '(medium)', '🗿 lite', '🦥 full']) assert.ok(l1.includes(s), `L1 falta ${s}`);
const noChanges = { ...fixture, cost: { ...fixture.cost, total_lines_added: 0, total_lines_removed: 0 } };
assert.ok(!render(noChanges, env, NOW).includes('+0'), 'velocity oculta sin cambios');
for (const s of ['⏱️ 12m', '🟡', '47%', '5h', '⏳ 1h23m', '34%', '↻', '7d', '38%', '$0.47']) assert.ok(l2.includes(s), `L2 falta ${s}`);

// Ventana semanal: transcurrido de la ventana y cuenta atrás hasta el reset, en días.
for (const s of ['⏳ 6d00h', '↻1d00h']) assert.ok(l2.includes(s), `semanal falta ${s}`);

// Por debajo de 24 h la duración cae al formato corto; el transcurrido sigue en días.
const weekSoon = { ...fixture, rate_limits: { seven_day: { used_percentage: 38, resets_at: NOW / 1000 + 2 * 3600 } } };
const soonL2 = render(weekSoon, env, NOW).split('\n')[1];
for (const s of ['⏳ 6d22h', '↻2h00m']) assert.ok(soonL2.includes(s), `semanal corto falta ${s}`);

// Patch 0018: el formato se elige con los minutos ya redondeados, nunca `24h00m`.
for (const [secs, want] of [[23 * 3600 + 59 * 60 + 30, '↻1d00h'], [23 * 3600 + 59 * 60, '↻23h59m'], [24 * 3600, '↻1d00h']]) {
    const edge = { ...fixture, rate_limits: { seven_day: { used_percentage: 38, resets_at: NOW / 1000 + secs } } };
    const edgeL2 = render(edge, env, NOW).split('\n')[1];
    assert.ok(edgeL2.includes(want), `reset a ${secs}s falta ${want}: «${edgeL2}»`);
}

// Sin resets_at el semanal degrada: solo 7d, barra y porcentaje.
const weekBare = { ...fixture, rate_limits: { seven_day: { used_percentage: 38 } } };
const bareL2 = render(weekBare, env, NOW).split('\n')[1];
assert.ok(bareL2.includes('38%'), 'semanal sin resets_at mantiene el porcentaje');
assert.ok(!bareL2.includes('⏳'), 'semanal sin resets_at no pinta ⏳');
assert.ok(!bareL2.includes('↻'), 'semanal sin resets_at no pinta ↻');

// resets_at inválido degrada como si no estuviera: nunca se pinta NaN (constitution, regla 3).
for (const bad of ['not-a-number', {}, NaN, null]) {
    const l = render({ rate_limits: { five_hour: { used_percentage: 20, resets_at: bad }, seven_day: { used_percentage: 38, resets_at: bad } } }, env, NOW);
    assert.ok(!l.includes('NaN'), `resets_at ${JSON.stringify(bad)} pinta NaN`);
    assert.ok(!l.includes('⏳'), `resets_at ${JSON.stringify(bad)} pinta ⏳`);
    assert.ok(!l.includes('↻'), `resets_at ${JSON.stringify(bad)} pinta ↻`);
}

// Reset ya vencido: las ventanas saturan, no se van a negativo.
const expired = { ...fixture, rate_limits: { five_hour: { used_percentage: 34, resets_at: NOW / 1000 - 600 }, seven_day: { used_percentage: 38, resets_at: NOW / 1000 - 600 } } };
const expiredL2 = render(expired, env, NOW).split('\n')[1];
for (const s of ['5h ⏳ 5h00m', '↻', '7d ⏳ 7d00h', '↻0m']) assert.ok(expiredL2.replace(/\x1b\[[0-9;]*m/g, '').includes(s), `reset vencido falta ${s}`);
assert.ok(!l1.includes('\uE0A0'), 'sin git no hay icono de branch');

const gitEnv = { ...env, git: { repo: 'EasyClaw', branch: 'main', worktree: 'feat-x' } };
const g1 = render(fixture, gitEnv, NOW).split('\n')[0];
for (const s of ['EasyClaw', '\uE0A0 main', '🌳 feat-x', '+156', '-23']) assert.ok(g1.includes(s), `git falta ${s}`);

// Worktree movido tras crearse: el id interno de git (.git/worktrees/<id>) no es el nombre de la carpeta.
const linked = gitNames('/code/.worktrees/proj/0006a', '/code/git/proj/.git', '/code/git/proj/.git/worktrees/52744-ad47b0e3');
assert.deepStrictEqual(linked, { repo: 'proj', worktree: '0006a' }, 'worktree: repo principal + nombre de carpeta');
const mainTree = gitNames('/code/git/proj', '/code/git/proj/.git', '/code/git/proj/.git');
assert.deepStrictEqual(mainTree, { repo: 'proj', worktree: null }, 'árbol principal: sin worktree');
const submodule = gitNames('/code/git/proj/sub', '/code/git/proj/.git/modules/sub', '/code/git/proj/.git/modules/sub');
assert.deepStrictEqual(submodule, { repo: 'sub', worktree: null }, 'submódulo: no es un worktree');

// Presupuesto de git: todas las llamadas de un refresco comparten 2000 ms.
{
    const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.max(0, ms));
    const PATHS = '/code/proj\n/code/proj/.git\n/code/proj/.git';
    const slow = (args, cwd, timeout) => {
        if (args.includes('--git-dir')) { sleep(Math.min(1500, timeout)); return timeout >= 1500 ? PATHS : null; }
        sleep(timeout);
        return null;
    };
    const t0 = Date.now();
    const slowGit = readGit({ cwd: '/code/proj' }, slow);
    const took = Date.now() - t0;
    // Margen holgado para una máquina cargada: lo que importa es quedar lejos de los 5500 ms sin plazo.
    assert.ok(took <= 2500, `readGit con git lento cabe en el presupuesto (${took} ms)`);
    assert.deepStrictEqual(slowGit, { repo: 'proj', worktree: null, branch: '?', dirty: false, ahead: null, behind: null, timedOut: true }, 'readGit con presupuesto agotado');
    const STATUS = '# branch.oid abc1234def\n# branch.head main\n# branch.upstream origin/main\n# branch.ab +2 -1\n1 .M N... 100644 100644 100644 a b statusline.js\n';
    const calls = [];
    const fast = (args) => { calls.push(args); return args.includes('--git-dir') ? PATHS : args[0] === 'status' ? STATUS : null; };
    assert.deepStrictEqual(readGit({ cwd: '/code/proj' }, fast), { repo: 'proj', worktree: null, branch: 'main', dirty: true, ahead: 2, behind: 1, timedOut: false }, 'readGit con git rápido');
    assert.strictEqual(calls.length, 2, 'readGit hace dos llamadas a git');
    assert.deepStrictEqual(calls[1], ['status', '--porcelain=v2', '--branch'], 'la segunda llamada es git status');
    const statusFails = (args) => (args.includes('--git-dir') ? PATHS : null);
    assert.deepStrictEqual(readGit({ cwd: '/code/proj' }, statusFails), { repo: 'proj', worktree: null, branch: '?', dirty: false, ahead: null, behind: null, timedOut: false }, 'git status que falla dentro de plazo');
    const pathsTimeout = (args, cwd, timeout) => { sleep(timeout); return null; };
    assert.deepStrictEqual(readGit({ cwd: '/code/proj' }, pathsTimeout), { timedOut: true }, 'presupuesto agotado en las rutas');
    assert.strictEqual(readGit({ cwd: '/code/proj' }, () => null), null, 'rutas que fallan rápido: sin git');

    const { spawnSync } = require('child_process'), path = require('path');
    const t1 = Date.now();
    const full = spawnSync(process.execPath, [path.join(__dirname, 'statusline.js')], { input: JSON.stringify({ cwd: __dirname }), encoding: 'utf8', timeout: 5000 });
    assert.ok(Date.now() - t1 < 3000, 'statusline completo por debajo de 3000 ms');
    assert.ok(full.status === 0 && full.stdout.trim() !== '', 'statusline completo pinta algo');
}

// Sin git ni directorio de proyecto (stdin vacío o inválido) la L1 no abre con un segmento vacío.
const bareL1 = render({}, env, NOW).split('\n')[0].replace(/\x1b\[[0-9;]*m/g, '');
assert.ok(bareL1.startsWith('🤖 ?'), `L1 sin ubicación empieza por el modelo: «${bareL1}»`);

const offEnv ={ ...env, flags: { caveman: null, ponytail: null } };
assert.ok(!render(fixture, offEnv, NOW).includes('🗿'), 'caveman off oculto');

// Modos de caveman 3.x (caveman, ultracave, megacave) y los antiguos, leídos del flag del perfil.
{
    const fs = require('fs'), os = require('os'), path = require('path');
    const { spawnSync } = require('child_process');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'statusline-flags-'));
    try {
        for (const mode of ['caveman', 'ultracave', 'megacave', 'lite']) {
            fs.writeFileSync(path.join(dir, '.caveman-active'), mode);
            const out = spawnSync(process.execPath, [path.join(__dirname, 'statusline.js')], { input: '{}', encoding: 'utf8', env: { ...process.env, CLAUDE_CONFIG_DIR: dir } }).stdout;
            assert.ok(out.includes(`🗿 ${mode}`), `caveman ${mode} visible`);
        }
        fs.writeFileSync(path.join(dir, '.caveman-active'), 'off');
        assert.ok(!spawnSync(process.execPath, [path.join(__dirname, 'statusline.js')], { input: '{}', encoding: 'utf8', env: { ...process.env, CLAUDE_CONFIG_DIR: dir } }).stdout.includes('🗿'), 'caveman off por flag oculto');
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

assert.strictEqual((bar(50, 10).match(/█/g) || []).length, 10, 'barra de 10 bloques');
assert.ok(bar(0, 10).includes('38;2;60;60;60'), 'bloque vacío gris');

// Sub-bloques: la celda de corte pinta el resto en octavos, sin cambiar el ancho.
const cells = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
const grayCells = (s) => (s.match(/38;2;60;60;60m█/g) || []).length;
assert.strictEqual(cells(bar(47, 10)), '████▊█████', '47 % en 10: 4 llenos, ▊, 5 vacíos');
assert.strictEqual(cells(bar(34, 8)), '██▊█████', '34 % en 8: 2 llenos, ▊, 5 vacíos');
assert.strictEqual(cells(bar(38, 8)), '████████', '38 % en 8: 3 llenos, 5 vacíos');
assert.strictEqual(grayCells(bar(38, 8)), 5, '38 %: 5 vacías grises');
assert.ok(bar(34, 8).includes('48;2;60;60;60m'), 'sub-bloque sobre fondo gris');
for (const v of ['x', -5]) assert.strictEqual(grayCells(bar(v, 8)), 8, `bar acota ${v}`);
for (const v of [150, 99.9]) assert.strictEqual(cells(bar(v, 8)), '████████', `bar satura ${v}`);
assert.strictEqual(cells(bar(1, 8)), '▏███████', 'bar pinta el octavo mínimo');
for (let r = 1; r <= 7; r++) assert.strictEqual(cells(bar(r * 100 / 64, 8))[0], '▏▎▍▌▋▊▉'[r - 1], `resto ${r}`);
assert.ok(bar(34, 8).includes(`${GRAY_BG}${gradientAt(2 / 7)}▊${RESET}`), 'sub-bloque con el color de su celda y RESET');

// Marcador de ritmo: dónde estarías gastando uniforme hasta el reset.
assert.ok(cells(l2).includes('██┃█████'), '5h con marcador');
assert.ok(cells(l2).includes('██████┃█'), 'semanal con marcador');
assert.strictEqual(cells(bar(80, 8, 27.7)), '██┃███▍█', '80 % con ritmo 27,7 %');
assert.ok(bar(80, 8, 27.7).includes(gradientAt(2 / 7).replace('38;2', '48;2')), 'marcador sobre gradiente');
assert.ok(bar(0, 8, 0).startsWith(GRAY_BG) && cells(bar(0, 8, 0)) === '┃███████', 'marcador sobre gris en la primera celda');
assert.strictEqual(cells(bar(38, 8, 100)), '███████┃', 'marcador en la última celda');
assert.ok(!cells(bar(38, 8)).includes('┃'), 'sin ritmo no hay marcador');
assert.ok(!cells(render(weekBare, env, NOW)).includes('┃'), 'sin marcador sin reset');
const weekAt = (resets_at) => cells(render({ rate_limits: { seven_day: { used_percentage: 38, resets_at } } }, env, NOW).split('\n')[1]);
assert.ok(weekAt(NOW / 1000 - 600).includes('███████┃'), 'semanal vencido: marcador en la última celda');
assert.ok(weekAt(NOW / 1000 + 8 * 86400).includes('⏳ 0m ┃███████'), 'semanal con reset lejano');
for (const bad of ['x', {}]) assert.ok(!weekAt(bad).includes('┃'), `semanal sin marcador con resets_at ${JSON.stringify(bad)}`);
assert.ok(!cells(l2).split('│')[1].includes('┃'), 'contexto sin marcador');

// Coste por hora: desde 5 minutos de sesión y con coste mayor que 0.
const costL2 = (cost) => cells(render({ ...fixture, cost }, env, NOW).split('\n')[1]);
assert.ok(costL2({ total_cost_usd: 0.47, total_duration_ms: 12 * 60000 }).includes('💰 $0.47 · $2.35/h'), 'coste por hora');
assert.ok(costL2({ total_cost_usd: 0.25, total_duration_ms: 5 * 60000 }).includes('$3.00/h'), 'coste por hora desde 5 min');
assert.ok(!costL2({ total_cost_usd: 0.2, total_duration_ms: 4 * 60000 }).includes('/h'), 'sin coste por hora antes de 5 min');
assert.ok(!costL2({ total_cost_usd: 0, total_duration_ms: 60 * 60000 }).includes('/h'), 'sin coste por hora con coste 0');
assert.ok(!costL2({ total_cost_usd: 0.47, total_duration_ms: 'x' }).includes('/h'), 'sin duración numérica');
assert.ok(costL2({ total_cost_usd: 'abc', total_duration_ms: 12 * 60000 }).includes('💰 $0.00'), 'coste no numérico');

// Icono de nivel en las ventanas, con los mismos cortes que el contexto.
const windows = (five, week) => cells(render({ rate_limits: { five_hour: { used_percentage: five }, seven_day: { used_percentage: week } } }, env, NOW).split('\n')[1]);
assert.ok(cells(l2).includes('🟡 5h ⏳ 1h23m') && cells(l2).includes('🟡 7d ⏳ 6d00h'), 'icono en las ventanas del fixture');
assert.ok(windows(95, 10).includes('🚨 5h') && windows(95, 10).includes('🟢 7d'), 'icono 🚨 y 🟢');
assert.ok(windows(90, 75).includes('🚨 5h') && windows(90, 75).includes('🔥 7d'), 'icono en el corte del 90');
assert.ok(windows('x', 'x').includes('🟢 5h') && windows('x', 'x').includes('🟢 7d'), 'icono con porcentaje no numérico');

// Un segmento que lanza un error pinta ⚠ en su sitio y no tira el statusline.
{
    const { spawnSync } = require('child_process'), path = require('path');
    const broken = cells(render({ workspace: { project_dir: 123 } }, env, NOW));
    assert.ok(broken.split('\n')[0].startsWith('⚠ │ 🤖 ?'), `segmento que falla pinta ⚠: «${broken.split('\n')[0]}»`);
    assert.ok(broken.split('\n')[1].includes('💰 $0.00'), 'el resto se pinta igual');
    assert.ok(!cells(render(fixture, env, NOW)).includes('⚠'), 'sin fallos no hay marcador');
    for (const input of ['null', '3', '"x"', '[]', '{"workspace":{"project_dir":123}}']) {
        const out = spawnSync(process.execPath, [path.join(__dirname, 'statusline.js')], { input, encoding: 'utf8', timeout: 5000 });
        const text = cells(out.stdout);
        assert.ok(out.status === 0 && out.stderr === '' && text.includes('🤖 ?'), `stdin ${input} pinta`);
        assert.ok(['⏱️ 0m', '0%', '$0.00'].every((s) => text.includes(s)), `stdin ${input} con valores por defecto`);
        if (input !== '{"workspace":{"project_dir":123}}') assert.ok(!text.includes('⚠'), `stdin ${input} sin ⚠`);
    }
}

// Valores del JSON de tipo inesperado: se tratan como ausentes, nunca se pinta basura.
{
    const garbage = (data) => cells(render(data, env, NOW));
    for (const ms of ['x', 1e999, {}]) assert.ok(garbage({ cost: { total_duration_ms: ms } }).includes('⏱️ 0m'), `reloj con ${JSON.stringify(ms)}`);
    assert.ok(garbage({ cost: { total_cost_usd: -1 } }).includes('💰 $0.00'), 'coste negativo');
    assert.ok(!garbage({ cost: { total_lines_added: {}, total_lines_removed: 'x' } }).includes('object'), 'velocity con tipos raros oculto');
    assert.ok(garbage({ cost: { total_lines_added: {}, total_lines_removed: 2 } }).includes('+0 -2'), 'velocity con un tipo raro');
    const far = garbage({ rate_limits: { five_hour: { used_percentage: 10, resets_at: 1e308 } } });
    assert.ok(!far.includes('NaN') && !far.includes('↻') && !far.includes('┃'), `resets_at fuera de rango como ausente: «${far.split('\n')[1]}»`);
    for (const s of ['NaN', 'Infinity', 'undefined', 'object']) assert.ok(!garbage({ cost: { total_duration_ms: 1e999, total_cost_usd: -5, total_lines_added: [], total_lines_removed: {} }, rate_limits: { five_hour: { used_percentage: 'x', resets_at: 1e308 }, seven_day: { used_percentage: {}, resets_at: 1e308 } } }).includes(s), `sin ${s}`);
}
assert.ok(render({ ...fixture, context_window: { used_percentage: 95 } }, env, NOW).includes('🚨'));
assert.ok(render({ ...fixture, context_window: { used_percentage: 10 } }, env, NOW).includes('🟢'));

// Lanzador: elige el Node de proto de versión más alta por SemVer, no por nombre de carpeta.
// Solo la 26.10.0 es un node.exe de verdad; las demás son hostname.exe, que no pinta el statusline.
if (process.platform === 'win32') {
    const fs = require('fs'), os = require('os'), path = require('path');
    const { spawnSync } = require('child_process');
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'statusline-proto-'));
    const base = path.join(home, '.proto', 'tools', 'node');
    try {
        for (const v of ['9.0.0', '26.9.0', '26.10.0', 'globals']) fs.mkdirSync(path.join(base, v), { recursive: true });
        for (const v of ['9.0.0', '26.9.0']) fs.copyFileSync(path.join(process.env.SystemRoot, 'System32', 'hostname.exe'), path.join(base, v, 'node.exe'));
        const real = path.join(base, '26.10.0', 'node.exe');
        try { fs.linkSync(process.execPath, real); } catch { fs.copyFileSync(process.execPath, real); }
        const run = spawnSync('cmd.exe', ['/d', '/c', path.join(__dirname, 'statusline.cmd')], { input: '{}', encoding: 'utf8', timeout: 10000, env: { ...process.env, USERPROFILE: home } });
        assert.ok(run.stdout.includes('🤖'), `statusline.cmd usa la 26.10.0, no la 9.0.0 ni la 26.9.0: «${run.stdout.trim()}»`);
    } finally {
        fs.rmSync(home, { recursive: true, force: true });
    }
}

// Instalador: solo Windows (install.ps1 necesita pwsh). Instalación limpia y update sobre una ya hecha.
if (process.platform === 'win32') {
    const fs = require('fs'), os = require('os'), path = require('path');
    const { spawnSync } = require('child_process');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'statusline-install-'));
    // -OrcaHook apunta a un hook que no existe: el resultado no depende de si Orca está instalado en esta máquina.
    const noOrca = path.join(dir, 'no-orca.cmd');
    const install = (orcaHook = noOrca) => spawnSync('pwsh', ['-NoProfile', '-File', path.join(__dirname, 'install.ps1'), '-ConfigDir', dir, '-OrcaHook', orcaHook], { encoding: 'utf8' });
    const cmd = path.join(dir, 'hooks', 'statusline.cmd');
    try {
        // Con Orca: el bloque apunta al wrapper que le reenvía el JSON.
        const orcaHook = path.join(dir, 'claude-statusline.cmd');
        fs.writeFileSync(orcaHook, '@echo off');
        const withOrca = install(orcaHook);
        const orcaCmd = path.join(dir, 'hooks', 'statusline-orca.cmd');
        assert.ok(withOrca.stdout.includes(`"\\"${orcaCmd.replace(/\\/g, '\\\\')}\\""`), 'con Orca el bloque apunta a statusline-orca.cmd');

        const fresh = install();
        assert.strictEqual(fresh.stderr, '', 'instalación limpia sin errores');
        assert.ok(fs.existsSync(path.join(dir, 'hooks', 'statusline.js')), 'copia statusline.js');
        assert.ok(fs.existsSync(path.join(dir, 'hooks', 'statusline-orca.cmd')), 'copia statusline-orca.cmd');
        assert.ok(fresh.stdout.includes(`"\\"${cmd.replace(/\\/g, '\\\\')}\\""`), 'bloque statusLine con la ruta escapada');
        assert.ok(!fs.existsSync(path.join(dir, 'settings.json')), 'no crea settings.json');

        const settings = JSON.stringify({ model: 'x', statusLine: { type: 'command', command: `"${cmd}"` } });
        fs.writeFileSync(path.join(dir, 'settings.json'), settings);
        fs.writeFileSync(path.join(dir, 'hooks', 'statusline.js'), '// versión vieja');
        const update = install();
        assert.strictEqual(update.stderr, '', 'update sin errores');
        assert.notStrictEqual(fs.readFileSync(path.join(dir, 'hooks', 'statusline.js'), 'utf8'), '// versión vieja', 'update sobrescribe');
        assert.ok(!update.stdout.includes('"statusLine"'), 'update: no pide pegar el bloque si ya está configurado');
        assert.strictEqual(fs.readFileSync(path.join(dir, 'settings.json'), 'utf8'), settings, 'update no toca settings.json');
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

// ---------- requisitos que dependen del entorno (perfil y ficheros flag) ----------
{
    const fs = require('fs'), os = require('os'), path = require('path');
    const { spawnSync } = require('child_process');
    const script = path.join(__dirname, 'statusline.js');
    // CAVEMAN_STATUSLINE_SAVINGS fijo: el valor exportado por el usuario no puede cambiar el resultado.
    const launch = (env) => {
        const r = spawnSync(process.execPath, [script], { input: '{}', encoding: 'utf8', timeout: 10000, env });
        assert.ok(r.status === 0 && typeof r.stdout === 'string', `statusline.js falló: status ${r.status}, ${r.error || r.stderr}`);
        return r.stdout;
    };
    const run = (dir, extra = {}) => launch({ ...process.env, CAVEMAN_STATUSLINE_SAVINGS: '1', CLAUDE_CONFIG_DIR: dir, ...extra });
    const l1 = (dir, extra) => cells(run(dir, extra).split('\n')[0]);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'statusline-env-'));
    try {
        // Perfil: el nombre del directorio, salvo que sea .claude.
        const profile = fs.mkdtempSync(path.join(root, 'statusline-perfil-'));
        assert.ok(l1(profile).startsWith(`🧪 ${path.basename(profile)} │`), 'perfil como primer segmento');
        const dotClaude = path.join(root, 'home', '.claude');
        fs.mkdirSync(dotClaude, { recursive: true });
        assert.ok(!l1(dotClaude).includes('🧪'), 'perfil .claude oculto');
        // Sin CLAUDE_CONFIG_DIR: el home apunta a un temporal para no leer el ~/.claude real.
        const { CLAUDE_CONFIG_DIR: _omit, ...noProfile } = process.env;
        const home = path.join(root, 'home');
        assert.ok(!cells(launch({ ...noProfile, USERPROFILE: home, HOME: home })).includes('🧪'), 'sin CLAUDE_CONFIG_DIR no hay perfil');

        // Valor de un flag.
        const flag = path.join(profile, '.ponytail-active');
        const ponytail = (content) => {
            fs.rmSync(flag, { recursive: true, force: true });
            if (content !== null) fs.writeFileSync(flag, content);
            return l1(profile);
        };
        assert.ok(ponytail('').includes('🦥 full'), 'flag vacío es full');
        for (const v of ['off', 'xyz', null]) assert.ok(!ponytail(v).includes('🦥'), `flag ${v} oculto`);

        // Lectura de ficheros flag: primera línea, minúsculas, solo a-z0-9-.
        assert.ok(ponytail('FULL\nlite').includes('🦥 full'), 'solo la primera línea, en minúsculas');
        assert.ok(ponytail('fu ll!').includes('🦥 full'), 'caracteres fuera de a-z0-9- eliminados');
        assert.ok(!ponytail('full' + ' '.repeat(61)).includes('🦥'), 'flag de más de 64 bytes ignorado');
        fs.rmSync(flag, { force: true });
        fs.mkdirSync(flag);
        assert.ok(!l1(profile).includes('🦥'), 'flag que no es un fichero ignorado');
        fs.rmSync(flag, { recursive: true, force: true });
        const target = path.join(root, 'target-flag');
        fs.writeFileSync(target, 'full');
        let linked = true;
        try { fs.symlinkSync(target, flag, 'file'); } catch { linked = false; }
        if (linked) assert.ok(!l1(profile).includes('🦥'), 'flag symlink ignorado');
        else console.log('  (symlink no permitido en este sistema: test del symlink omitido)');
        fs.rmSync(flag, { force: true });

        // Saneado del sufijo de ahorro: sin caracteres de control ni secuencias ANSI ajenas.
        fs.writeFileSync(path.join(profile, '.caveman-active'), 'lite');
        fs.writeFileSync(path.join(profile, '.ponytail-active'), 'full');
        fs.writeFileSync(path.join(profile, '.caveman-statusline-suffix'), '\x1b[31mX\x07\tY\rZ\n');
        const raw = run(profile).split('\n')[0];
        assert.ok(cells(raw).includes('🗿 lite [31mXYZ') && !raw.includes('\x1b[31mX') && !/[\x07\t\r]/.test(raw), 'sufijo sin escape ni control');
        // DEL y los C1 (U+0080–U+009F; U+009B es un CSI de un carácter) también son controles.
        fs.writeFileSync(path.join(profile, '.caveman-statusline-suffix'), 'A\x7fB\u009b31mC\u0085D');
        const c1 = run(profile).split('\n')[0];
        assert.ok(cells(c1).includes('🗿 lite AB31mCD') && !/[\x7f-\x9f]/.test(c1), `sufijo sin DEL ni C1: «${JSON.stringify(cells(c1))}»`);

        // El statusline nunca escribe en el perfil: mismos ficheros y mismo contenido tras pintar.
        const snapshot = () => fs.readdirSync(profile).sort().map((f) => `${f}=${fs.readFileSync(path.join(profile, f), 'utf8')}`).join('|');
        const before = snapshot();
        run(profile);
        assert.strictEqual(snapshot(), before, 'el perfil no cambia al pintar');
        assert.ok(!l1(profile, { CAVEMAN_STATUSLINE_SAVINGS: '0' }).includes('[31mX'), 'sufijo oculto con CAVEMAN_STATUSLINE_SAVINGS=0');
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

// Directorio del proyecto: project_dir, si falta current_dir, si falta cwd.
{
    const where = (data) => cells(render(data, env, NOW).split('\n')[0]).split(' │')[0];
    assert.strictEqual(where({ workspace: { project_dir: '/a/proj', current_dir: '/a/cur' }, cwd: '/a/cwd' }), 'proj', 'manda project_dir');
    assert.strictEqual(where({ workspace: { current_dir: '/a/cur' }, cwd: '/a/cwd' }), 'cur', 'sin project_dir, current_dir');
    assert.strictEqual(where({ cwd: '/a/cwd' }), 'cwd', 'sin workspace, cwd');
}

// Detached HEAD: sin rama, el hash corto; sin hash, ?.
{
    const PATHS = '/code/proj\n/code/proj/.git\n/code/proj/.git';
    const detached = (sha) => (args) => (args.includes('--git-dir') ? PATHS : args[0] === 'status' && sha ? `# branch.oid ${sha}def5678\n# branch.head (detached)\n` : null);
    assert.strictEqual(readGit({ cwd: '/code/proj' }, detached('abc1234')).branch, 'abc1234', 'detached HEAD pinta el hash corto');
    assert.strictEqual(readGit({ cwd: '/code/proj' }, detached(null)).branch, '?', 'sin hash, ?');
    for (const [sha, shown] of [['abc1234', 'abc1234'], [null, '?']]) {
        const line = cells(render({ cwd: '/code/proj' }, { ...env, git: readGit({ cwd: '/code/proj' }, detached(sha)) }, NOW).split('\n')[0]);
        assert.ok(line.startsWith(`proj  ${shown} │`), `L1 en detached HEAD con ${shown}`);
    }
}

// git status --porcelain=v2 --branch: rama, cambios y ahead/behind frente al upstream.
{
    const head = (h, extra = '') => `# branch.oid abc1234def5678\n# branch.head ${h}\n${extra}`;
    const UP = '# branch.upstream origin/main\n';
    assert.deepStrictEqual(parseStatus(head('main', `${UP}# branch.ab +2 -1\n1 .M N... 100644 100644 100644 a b x.js\n`)),
        { branch: 'main', dirty: true, ahead: 2, behind: 1 }, 'parseStatus con cambios, por delante y por detrás');
    assert.deepStrictEqual(parseStatus(head('main', `${UP}# branch.ab +0 -0\n`)),
        { branch: 'main', dirty: false, ahead: 0, behind: 0 }, 'parseStatus limpio y al día');
    assert.strictEqual(parseStatus(head('main', '? u.txt\n')).dirty, true, 'parseStatus: sin seguimiento cuenta como cambio');
    assert.strictEqual(parseStatus(head('main', 'u UU N... 100644 100644 100644 100644 a b c x.js\n')).dirty, true, 'parseStatus: conflicto cuenta como cambio');
    assert.deepStrictEqual(parseStatus(head('(detached)')),
        { branch: 'abc1234', dirty: false, ahead: null, behind: null }, 'parseStatus en detached HEAD');
    assert.deepStrictEqual(parseStatus(head('nou')),
        { branch: 'nou', dirty: false, ahead: null, behind: null }, 'parseStatus sin upstream');
    assert.deepStrictEqual(parseStatus(head('main', UP)),
        { branch: 'main', dirty: false, ahead: null, behind: null }, 'parseStatus upstream borrado');
    assert.strictEqual(parseStatus(head('main', '# stash 2\n')).dirty, false, 'parseStatus: # stash (status.showStash) no es un cambio');
    assert.strictEqual(parseStatus('# branch.oid (initial)\n# branch.head main\n').branch, 'main', 'parseStatus rama sin commits');
    assert.deepStrictEqual(parseStatus(head('main', `${UP}# branch.ab +3 -4\n`).replace(/\n/g, '\r\n')),
        { branch: 'main', dirty: false, ahead: 3, behind: 4 }, 'parseStatus con CRLF');
}

// Estado de git junto a la rama: ● con cambios, ↑↓ frente al upstream, ⚠ con el presupuesto agotado.
{
    const B = '';
    const at = (git, data = { cwd: '/code/proj' }) => render(data, { ...env, git }, NOW).split('\n')[0];
    const base = { repo: 'proj', branch: 'main', worktree: null, dirty: true, ahead: 2, behind: 1, timedOut: false };
    const full = at(base);
    assert.ok(cells(full).startsWith(`proj ${B} main ● ↑2↓1 │`), `marcas junto a la rama: «${cells(full)}»`);
    assert.ok(full.includes('\x1b[38;2;220;200;0m●'), '● en amarillo');
    assert.ok(full.includes('\x1b[38;2;130;130;130m↑2↓1'), '↑↓ en gris atenuado');
    assert.ok(cells(at({ ...base, behind: 0 })).startsWith(`proj ${B} main ● ↑2 │`), 'solo por delante: ↑2');
    assert.ok(cells(at({ ...base, ahead: 0, behind: 0 })).startsWith(`proj ${B} main ● │`), '↑0↓0 no se pinta');
    assert.ok(cells(at({ ...base, ahead: null, behind: null })).startsWith(`proj ${B} main ● │`), 'sin upstream no hay ↑↓');
    assert.ok(cells(at({ ...base, dirty: false, ahead: 0, behind: 3 })).startsWith(`proj ${B} main ↓3 │`), 'limpio y por detrás: ↓3 sin ●');
    assert.ok(cells(at({ ...base, behind: 0, worktree: 'feat-x' })).startsWith(`proj ${B} main ● ↑2 🌳 feat-x │`), 'marcas antes del worktree');
    const late = at({ repo: 'proj', branch: '?', worktree: null, dirty: false, ahead: null, behind: null, timedOut: true });
    assert.ok(cells(late).startsWith(`proj ${B} ? ⚠ │`), `presupuesto agotado tras las rutas: «${cells(late)}»`);
    assert.ok(late.includes('\x1b[38;2;60;60;60m⚠'), '⚠ en gris');
    assert.ok(cells(at({ timedOut: true })).startsWith('proj ⚠ │'), `presupuesto agotado en las rutas: «${cells(at({ timedOut: true }))}»`);
    assert.ok(cells(at(null)).startsWith('proj │'), 'sin git: solo el nombre, sin ⚠');
    const seg = full.split(/ \x1b\[38;2;60;60;60m│\x1b\[0m /)[0];
    assert.ok(seg.lastIndexOf('\x1b[0m') > seg.lastIndexOf('\x1b[38;2'), 'la ubicación con marcas cierra su color');
}

// Color del porcentaje: mismos cortes que el icono, en el contexto y en las dos ventanas.
for (const [pct, color] of [[19, '80;200;120'], [20, '220;200;0'], [69, '220;200;0'], [70, '255;140;0'], [89, '255;140;0'], [90, '220;60;40']]) {
    const out = render({ context_window: { used_percentage: pct }, rate_limits: { five_hour: { used_percentage: pct }, seven_day: { used_percentage: pct } } }, env, NOW);
    assert.strictEqual(out.split(`\x1b[38;2;${color}m${pct}%`).length - 1, 3, `color del ${pct} % en contexto, 5h y 7d`);
}

// Color: ningún segmento arrastra su color; repo naranja y negrita, branch verde, modelo magenta.
{
    const out = render(fixture, gitEnv, NOW);
    for (const seg of out.split('\n').flatMap((line) => line.split(/ \x1b\[38;2;60;60;60m│\x1b\[0m /))) {
        const lastColor = Math.max(seg.lastIndexOf('\x1b[38;2'), seg.lastIndexOf('\x1b[48;2'), seg.lastIndexOf('\x1b[1m'));
        assert.ok(lastColor === -1 || seg.lastIndexOf('\x1b[0m') > lastColor, `segmento sin reset final: «${cells(seg)}»`);
    }
    assert.ok(out.includes('\x1b[1m\x1b[38;2;217;119;87mEasyClaw'), 'repo en negrita y naranja');
    assert.ok(out.includes('\x1b[38;2;80;200;120m main'), 'branch en verde');
    assert.ok(out.includes('\x1b[38;2;200;120;220m🤖 Fable 5.1'), 'modelo en magenta');
}

// Wrapper de Orca: pinta el statusline, reenvía el mismo JSON a Orca y borra su temporal.
if (process.platform === 'win32') {
    const fs = require('fs'), os = require('os'), path = require('path');
    const { spawnSync } = require('child_process');
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'statusline-orca-'));
    const temp = path.join(home, 'tmp');
    try {
        fs.mkdirSync(temp);
        const hooks = path.join(home, '.orca', 'agent-hooks');
        fs.mkdirSync(hooks, { recursive: true });
        fs.writeFileSync(path.join(hooks, 'claude-statusline.cmd'), '@echo off\r\nfindstr "^" > "%~dp0got.json"\r\n');
        const input = '{"model":{"display_name":"Orca test"}}';
        // Sin proto en el USERPROFILE de prueba, statusline.cmd usa el node del PATH: el de este test.
        const pathKey = Object.keys(process.env).find((k) => k.toUpperCase() === 'PATH') || 'PATH';
        const pathWithNode = `${path.dirname(process.execPath)};${process.env[pathKey]}`;
        const run = spawnSync('cmd.exe', ['/d', '/c', path.join(__dirname, 'statusline-orca.cmd')], {
            input, encoding: 'utf8', timeout: 10000, env: { ...process.env, USERPROFILE: home, TEMP: temp, TMP: temp, [pathKey]: pathWithNode },
        });
        assert.strictEqual(run.status, 0, 'wrapper de Orca sale con 0');
        assert.ok(cells(run.stdout).includes('🤖 Orca test'), 'wrapper de Orca pinta el statusline');
        assert.ok(fs.readFileSync(path.join(hooks, 'got.json'), 'utf8').includes('"Orca test"'), 'Orca recibe el mismo JSON');
        assert.deepStrictEqual(fs.readdirSync(temp).filter((f) => f.startsWith('cc-statusline-')), [], 'el temporal se borra');
    } finally {
        fs.rmSync(home, { recursive: true, force: true });
    }
}

console.log('statusline.test.js OK');
