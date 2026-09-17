'use strict';
// Self-check del statusline: node hooks/statusline.test.js
const assert = require('assert');
const { render, bar } = require('./statusline.js');

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
assert.ok(!l1.includes('\uE0A0'), 'sin git no hay icono de branch');

const gitEnv = { ...env, git: { repo: 'EasyClaw', branch: 'main', worktree: 'feat-x' } };
const g1 = render(fixture, gitEnv, NOW).split('\n')[0];
for (const s of ['EasyClaw', '\uE0A0 main', '🌳 feat-x', '+156', '-23']) assert.ok(g1.includes(s), `git falta ${s}`);

const offEnv = { ...env, flags: { caveman: null, ponytail: null } };
assert.ok(!render(fixture, offEnv, NOW).includes('🗿'), 'caveman off oculto');

assert.strictEqual((bar(50, 10).match(/█/g) || []).length, 10, 'barra de 10 bloques');
assert.ok(bar(0, 10).includes('38;2;60;60;60'), 'bloque vacío gris');
assert.ok(render({ ...fixture, context_window: { used_percentage: 95 } }, env, NOW).includes('🚨'));
assert.ok(render({ ...fixture, context_window: { used_percentage: 10 } }, env, NOW).includes('🟢'));

console.log('statusline.test.js OK');
