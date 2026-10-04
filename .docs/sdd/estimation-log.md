<!-- AUTO-GENERADO por Build-EstimationLog.ps1 (sdd-kit) — no editar a mano. Regenerar: pwsh -NoProfile -File <sdd-templates>/scripts/Build-EstimationLog.ps1 -Root <proyecto> -->
# Estimation log (estimado vs real)

| Fecha | Id | Tipo | Est (h) | Real (h) | Ratio | Hilo (tokens) | Subagentes (tokens) | Sujetos ($) | Sesión ($) | Carpeta |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-20 | 0000 | patch | — | 0.5 | — | — | — | — | — | 20260920-160436-patch-0000-worktree-name |
| 2026-09-20 | 0000 | patch | — | 0.3 | — | — | — | — | — | 20260920-161940-patch-0000-installer-update |
| 2026-09-21 | 0008 | infra/tooling | 1 | 0.8 | 0.8 | — | — | — | — | 20260920-215837-task-0008-weekly-reset |
| 2026-10-04 | 0009 | patch | — | 0.5 | — | — | — | — | — | 20261004-113838-patch-0009-orca-wrapper |
| 2026-10-04 | 0010 | frontend | 0.3 | 0.15 | 0.5 | 4076k | 99k | no aplica | sin precio | 20261004-141040-feature-0010-sub-block-bars |
| 2026-10-04 | 0011 | frontend | 0.3 | 0.3 | 1 | 4402k | 222k | no aplica | sin precio | 20261004-143157-feature-0011-pace-marker |
| 2026-10-04 | 0013 | frontend | 0.3 | 0.25 | 0.83 | 4132k | 156k | no aplica | sin precio | 20261004-151215-feature-0013-cost-per-hour |
| 2026-10-04 | 0014 | patch | — | 0.2 | — | — | — | — | — | 20261004-152212-patch-0014-caveman-modes |
| 2026-10-04 | 0001 | backend | 0.3 | 0.3 | 1 | 5858k | 211k | no aplica | sin precio | 20261004-152728-feature-0001-git-time-budget |
| 2026-10-04 | 0015 | patch | — | 0.1 | — | — | — | — | — | 20261004-170112-patch-0015-timing-tests |
| 2026-10-04 | 0003 | patch | — | 0.15 | — | — | — | — | — | 20261004-175801-patch-0003-empty-location |
| 2026-10-04 | 0004 | patch | — | 0.3 | — | — | — | — | — | 20261004-182241-patch-0004-node-semver |
| 2026-10-04 | 0005 | frontend | 0.2 | 0.2 | 1 | 4155k | 210k | no aplica | sin precio | 20261004-185434-feature-0005-quota-alert-icon |
| 2026-10-04 | 0006 | backend | 0.3 | 0.35 | 1.17 | 7288k | 285k | no aplica | sin precio | 20261004-203701-feature-0006-failed-segment-mark |
| 2026-10-04 | 0016 | patch | — | 0.3 | — | — | — | — | — | 20261004-204410-patch-0016-json-garbage |
| 2026-10-04 | 0002 | chore | 0.5 | 0.6 | 1.2 | 9802k | 497k | no aplica | sin precio | 20261004-214415-feature-0002-untested-requirements |
| 2026-10-04 | 0017 | patch | — | 0.1 | — | — | — | — | — | 20261004-215710-patch-0017-suffix-c1 |
| 2026-10-05 | 0007 | docs | 0.3 | 0.15 | 0.5 | 5874k | 223k | no aplica | sin precio | 20261004-220000-feature-0007-bilingual-readme |

**Factor de calibración** (ratio mediano real/estimado, 9 artefactos): **1** · media 0.89

- p25–p75: 0.8–1
- p80: 1.07 — para comprometer una fecha, multiplica la estimación por el p80: así cubre 4 de cada 5 artefactos.
- Dentro de ±25 %: 78 % · sobreestimadas: 22 % · infraestimadas: 0 %
- Error absoluto (h): media 0.08 · mediana 0.05
- Tendencia: n insuficiente (hacen falta 20)

| Tramo del ratio | n | % |
| --- | --- | --- |
| <0.5 | 0 | 0 % |
| 0.5–0.8 | 2 | 22 % |
| 0.8–1.25 | 7 | 78 % |
| 1.25–2 | 0 | 0 % |
| ≥2 | 0 | 0 % |

| Tipo | n | Mediana | p25–p75 |
| --- | --- | --- | --- |
| backend | 2 | 1.08 | — |
| chore | 1 | 1.2 | — |
| docs | 1 | 0.5 | — |
| frontend | 4 | 0.92 | — |
| infra/tooling | 1 | 0.8 | — |

| Release | Artefactos | Horas reales | Mediana | Sujetos ($) | Sesión ($) |
| --- | --- | --- | --- | --- | --- |
| 1.0.0 | 2 | 0.8 | — | — | — |
| 1.1.0 | 16 | 4.75 | 1 | — | — |

> Con menos de 10 tareas con ratio la calibración es orientativa. Ver `estimation.md`.
