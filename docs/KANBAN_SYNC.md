# Automatic Kanban and Burndown Sync

## Behavior

The workflow in `.github/workflows/sync-kanban.yml` reads [project 1](https://github.com/users/phangsx25/projects/1) hourly at minute 17 and updates `docs/KANBAN.md`, `docs/sprint1-burndown.json`, `docs/sprint1-burndown.md` and `docs/sprint1-burndown.svg`. GitHub can delay schedules; this is not immediate synchronization. **Actions → Sync Kanban and Burndown → Run workflow** also allows a manual refresh.

Only the generated files are committed, and unchanged data creates no commit. No dependencies need installation. Kanban refreshes after Sprint 1 ends; the Sprint 1 burndown preserves its history and stops collecting new observations outside 5–18 November 2026, Kuala Lumpur time. During the sprint, a new date or changed status adds an observation; repeated same-day identical runs do not duplicate data. Estimates come from the product backlog baseline. Only Done burns points; prior unobserved dates remain blank.

## Activation

1. Review and merge the workflow and scripts into the repository's default branch (`main`). Scheduled workflows only run from that branch. This file being present on a PR branch does not activate the schedule.
2. Create a dedicated GitHub token for the account that can read the personal Project. A classic PAT with `read:project` is sufficient for reading public project data; private linked issues additionally need appropriate repository access (`repo` for classic tokens). A fine-grained PAT must target the project owner with user Projects read permission and any required linked-repository read access. This is separate from the local CLI login. Do not reuse or paste the local CLI credential.
3. In the **ThenFrame_AppForge** repository, open **Settings → Secrets and variables → Actions → New repository secret**. Name it **`PROJECTS_READ_TOKEN`** and enter the token there, not in source or chat. Give it an expiry and rotate the secret when it expires.
4. The workflow uses the dedicated secret only to read Projects. Git checkout/push uses the repository's built-in `GITHUB_TOKEN` with `contents: write`. Branch rules must allow this bot's generated-document commits; if they require PRs, the push will fail and a PR-based publishing approach is needed. Do not disable rules just to make the job pass.
5. Run the workflow manually once, confirm a successful Actions run and inspect the generated documentation commit. A workflow file alone does not establish a successful sync.

Official references: [Projects automation and authentication](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions), [GitHub CLI project scopes](https://cli.github.com/manual/gh_project), [workflow events and schedules](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

## Local use

```powershell
node scripts/sync-kanban.mjs
```

If needed, set `$env:THENFRAME_GH_PATH` to the installed `gh.exe`. For offline verification, pass `--input path/to/project-item-list.json`; neither mode changes GitHub cards. Only generated repo files change. Review and commit local output as usual.

The workflow does not retroactively recover card history, maintain meeting logs, merge feature branches or mark stories Done. Snapshot timestamps are actual observation times. Scheduled commits made with `GITHUB_TOKEN` generally do not trigger another GitHub Actions workflow; deployment-provider behavior is independent.
