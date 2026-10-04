'use strict';
// Self-check del statusline: node hooks/statusline.test.js
const assert = require('assert');
const { render, bar, gitNames, gradientAt, GRAY_BG, RESET } = require('./statusline.js');

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
assert.ok(render({ ...fixture, context_window: { used_percentage: 95 } }, env, NOW).includes('🚨'));
assert.ok(render({ ...fixture, context_window: { used_percentage: 10 } }, env, NOW).includes('🟢'));

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

console.log('statusline.test.js OK');
