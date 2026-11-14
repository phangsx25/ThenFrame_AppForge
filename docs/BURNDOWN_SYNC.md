# Burndown Automation Guide

The interactive [GitHub Projects Kanban](https://github.com/users/phangsx25/projects/1) is the only Kanban. No Markdown board copy is generated.

This shared guide describes the current Sprint 1 updater. Later sprint folders contain planning templates only; adding folders does not enable automatic charts for those sprints.

## Behavior

`.github/workflows/sync-burndown.yml` reads the Project hourly at minute 17 (UTC) and updates only `docs/sprint-1/sprint1-burndown.json`, `docs/sprint-1/sprint1-burndown.md` and `docs/sprint-1/sprint1-burndown.svg`. GitHub may delay runs. You can also use **Actions → Sync Sprint 1 Burndown → Run workflow**.

Only Done burns points. A new day or changed Sprint 1 status creates an observation; unchanged same-day runs create no duplicate. Missing historical dates stay blank. Outside 5–18 November 2026 (Kuala Lumpur), the chart/history remain frozen and the workflow makes no new observations. No future sprint charts are generated. The script never changes Project cards.

## Activation

1. The workflow must exist on the default branch (`main`), where the Sprint 1 workflow has already been merged. Scheduled workflows do not run from feature branches.
2. Create a dedicated GitHub token with read access to the personal Project. A classic PAT can use `read:project`; private linked issues additionally require repository access. Do not reuse the local CLI credential.
3. Open **ThenFrame_AppForge → Settings → Secrets and variables → Actions → New repository secret**. Add **PROJECTS_READ_TOKEN**, pasting the token only into GitHub Secret, not chat/source. Set an expiry and rotate when needed.
4. The secret reads Projects; the built-in `GITHUB_TOKEN` with `contents: write` commits only the three generated files. Branch rules must permit publishing these commits. If they require PRs, use a PR-based publishing design instead of disabling rules.
5. Run manually once and inspect the successful Actions run and output. The workflow has not been activated or verified on GitHub until these steps are complete.

## Local update

```powershell
node scripts/update-burndown.mjs
```

Requires Node.js and authenticated GitHub CLI. Set `THENFRAME_GH_PATH` to gh.exe if it is absent from PATH. Use `--input path/to/board.json` with a `gh project item-list` export for offline checks. Generated files must be committed/pushed to publish local updates.

Official references: [Projects automation](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions), [GitHub CLI Project scopes](https://cli.github.com/manual/gh_project), [scheduled workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).
