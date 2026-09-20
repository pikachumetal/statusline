'use strict';
// Self-check del statusline: node hooks/statusline.test.js
const assert = require('assert');
const { render, bar, gitNames } = require('./statusline.js');

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

assert.strictEqual((bar(50, 10).match(/█/g) || []).length, 10, 'barra de 10 bloques');
assert.ok(bar(0, 10).includes('38;2;60;60;60'), 'bloque vacío gris');
assert.ok(render({ ...fixture, context_window: { used_percentage: 95 } }, env, NOW).includes('🚨'));
assert.ok(render({ ...fixture, context_window: { used_percentage: 10 } }, env, NOW).includes('🟢'));

// Instalador: solo Windows (install.ps1 necesita pwsh). Instalación limpia y update sobre una ya hecha.
if (process.platform === 'win32') {
    const fs = require('fs'), os = require('os'), path = require('path');
    const { spawnSync } = require('child_process');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'statusline-install-'));
    const install = () => spawnSync('pwsh', ['-NoProfile', '-File', path.join(__dirname, 'install.ps1'), '-ConfigDir', dir], { encoding: 'utf8' });
    const cmd = path.join(dir, 'hooks', 'statusline.cmd');
    try {
        const fresh = install();
        assert.strictEqual(fresh.stderr, '', 'instalación limpia sin errores');
        assert.ok(fs.existsSync(path.join(dir, 'hooks', 'statusline.js')), 'copia statusline.js');
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
