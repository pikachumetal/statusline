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

**Factor de calibración** (ratio mediano real/estimado, 3 artefactos): **0.8** · media 0.77

- n insuficiente (hacen falta 5)
- Tendencia: n insuficiente (hacen falta 20)

| Tipo | n | Mediana | p25–p75 |
| --- | --- | --- | --- |
| frontend | 2 | 0.75 | — |
| infra/tooling | 1 | 0.8 | — |

| Release | Artefactos | Horas reales | Mediana | Sujetos ($) | Sesión ($) |
| --- | --- | --- | --- | --- | --- |
| 1.0.0 | 2 | 0.8 | — | — | — |
| sin publicar | 4 | 1.75 | 0.8 | — | — |

> Con menos de 10 tareas con ratio la calibración es orientativa. Ver `estimation.md`.
