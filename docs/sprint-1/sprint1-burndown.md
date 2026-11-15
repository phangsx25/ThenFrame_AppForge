# Sprint 1 — Burndown Chart

![Sprint 1 burndown](sprint1-burndown.svg)

Sprint: **5–18 November 2026**. Baseline: **16 story points** from US01–US04 in [PRODUCT_BACKLOG.md](../PRODUCT_BACKLOG.md). Status source: [GitHub Kanban](https://github.com/users/phangsx25/projects/1).

## Latest observed status — 2026-11-16

| Story | Points | Status | Completed points |
| --- | --- | --- | --- |
| [US01](https://github.com/phangsx25/AppDev_G03_AppForge_ThenFrame/issues/1) | 3 | In review | 0 |
| [US02](https://github.com/phangsx25/AppDev_G03_AppForge_ThenFrame/issues/2) | 3 | In review | 0 |
| [US03](https://github.com/phangsx25/AppDev_G03_AppForge_ThenFrame/issues/3) | 5 | In review | 0 |
| [US04](https://github.com/phangsx25/AppDev_G03_AppForge_ThenFrame/issues/4) | 5 | In review | 0 |
| **Total** | **16** | | **0** |

**Remaining: 16 points.** In progress and In review do not burn points. A flat actual result does not mean no development occurred: whole-story completion is counted only when the card reaches Done. The chart reads board status; it does not independently certify acceptance criteria.

## Daily observations

| Date (Kuala Lumpur) | Completed | Remaining |
| --- | --- | --- |
| 2026-11-14 | 0 | 16 |
| 2026-11-16 | 0 | 16 |

Earlier daily values are unknown, so no historical actual values are invented. The dashed ideal line declines linearly from 16 to 0 over calendar days, including weekends and the holiday; it is a reference, not reported work. Missing observations are not interpolated. Future actual progress is not plotted.

## Update

After changing Kanban statuses, run from the repository root:

```powershell
node scripts/update-burndown.mjs
```

Requires Node.js and GitHub CLI signed in with project read access. If gh is absent from the terminal PATH, set THENFRAME_GH_PATH to its executable path. A new day or changed story status appends an observation to [sprint1-burndown.json](sprint1-burndown.json); unchanged same-day runs do not add duplicates. The displayed daily value uses the last observation that day. Outside Sprint 1, history is preserved without adding observations. The script does not modify GitHub cards. [Automatic sync setup](../BURNDOWN_SYNC.md) explains the hourly workflow, required secret and activation steps.
