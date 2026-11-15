import { readProject } from './read-project.mjs';
import { points, sprint1Stories } from './sprint1-stories.mjs';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Read-only GitHub access. No project fields or issue statuses are modified.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docDir = resolve(root, 'docs/sprint-1');
const dataPath = resolve(docDir, 'sprint1-burndown.json');
const inputIndex = process.argv.indexOf('--input');
if (inputIndex !== -1 && !process.argv[inputIndex + 1]) {
  throw new Error('--input requires a GitHub project item-list JSON file');
}
const gh = process.env.THENFRAME_GH_PATH || 'gh';
const raw = inputIndex !== -1
  ? readFileSync(process.argv[inputIndex + 1], 'utf8')
  : JSON.stringify(readProject(gh));
const board = JSON.parse(raw.replace(/^\uFEFF/, ''));
if (!Array.isArray(board.items) || board.items.length < board.totalCount) {
  throw new Error('Incomplete project response; no snapshot saved');
}
const stories = sprint1Stories(board);
const now = new Date();
const localDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(now);
const start = '2026-11-05';
const end = '2026-11-18';
if (localDate < start || localDate > end) {
  console.log('Outside Sprint 1: historical burndown preserved; no observation added.');
  process.exit(0);
}
const total = Object.values(points).reduce((sum, n) => sum + n, 0);
const done = stories.filter(story => story.status === 'Done').reduce((sum, story) => sum + story.points, 0);
const history = existsSync(dataPath)
  ? JSON.parse(readFileSync(dataPath, 'utf8'))
  : { sprint: 1, start, end, timezone: 'Asia/Kuala_Lumpur', totalPoints: total,
    estimateSource: '../PRODUCT_BACKLOG.md: US01=3, US02=3, US03=5, US04=5', snapshots: [] };
if (history.start !== start || history.end !== end || history.totalPoints !== total) {
  throw new Error('Sprint baseline changed; reconcile history before saving');
}
// Record daily values and status changes without hourly duplicate commits.
const previous = history.snapshots.at(-1);
if (!previous || previous.date !== localDate || JSON.stringify(previous.stories) !== JSON.stringify(stories)) {
  history.snapshots.push({ date: localDate, recordedAt: now.toISOString(),
    completedPoints: done, remainingPoints: total - done, stories });
}
mkdirSync(docDir, { recursive: true });
writeFileSync(dataPath, `${JSON.stringify(history, null, 2)}\n`);

// Display the latest observation each day. Missing history remains absent.
const latestByDate = new Map();
for (const snapshot of history.snapshots) latestByDate.set(snapshot.date, snapshot);
const snapshots = [...latestByDate.values()].sort((a, b) => a.date.localeCompare(b.date));
const dayMs = 86400000;
const dateMs = value => Date.parse(`${value}T00:00:00Z`);
const days = (dateMs(end) - dateMs(start)) / dayMs;
const x = date => 85 + ((dateMs(date) - dateMs(start)) / dayMs) * 840;
const y = value => 370 - (value / total) * 260;
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[char]);
const parts = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="1020" height="510" viewBox="0 0 1020 510" role="img" aria-labelledby="title desc">',
  '<title id="title">ThenFrame Sprint 1 Burndown</title>',
  '<desc id="desc">16 story points across US01 to US04. Dashed ideal line is a calendar-day reference. Actual points come from observed GitHub Done statuses; unavailable historical dates are not plotted.</desc>',
  '<rect width="1020" height="510" rx="16" fill="#fffaf8"/>',
  '<g font-family="Arial, sans-serif" fill="#35262c">',
  '<text x="45" y="42" font-size="25" font-weight="bold">ThenFrame / Sprint 1 Burndown</text>',
  `<text x="45" y="68" font-size="14">5–18 Nov 2026 · ${total} points · Done only · Kuala Lumpur time</text>`,
];
for (let n = 0; n <= total; n += 4) {
  parts.push(`<line x1="85" y1="${y(n)}" x2="925" y2="${y(n)}" stroke="#e7dddf"/>`,
    `<text x="69" y="${y(n) + 5}" font-size="13" text-anchor="end">${n}</text>`);
}
for (let n = 0; n <= days; n++) {
  const date = new Date(dateMs(start) + n * dayMs).toISOString().slice(0, 10);
  parts.push(`<text x="${x(date)}" y="396" font-size="12" text-anchor="middle">${date.slice(8)} Nov</text>`);
}
parts.push('<text x="22" y="258" font-size="13" transform="rotate(-90 22 258)">Remaining story points</text>',
  `<line x1="${x(start)}" y1="${y(total)}" x2="${x(end)}" y2="${y(0)}" stroke="#9a9fa8" stroke-width="2.5" stroke-dasharray="8 6"/>`);
// Connect only consecutive observed dates; never imply values in historical gaps.
for (let i = 1; i < snapshots.length; i++) {
  const a = snapshots[i - 1], b = snapshots[i];
  if (dateMs(b.date) - dateMs(a.date) === dayMs) {
    parts.push(`<line x1="${x(a.date)}" y1="${y(a.remainingPoints)}" x2="${x(b.date)}" y2="${y(b.remainingPoints)}" stroke="#852d4d" stroke-width="3"/>`);
  }
}
for (const snapshot of snapshots) {
  parts.push(`<circle cx="${x(snapshot.date)}" cy="${y(snapshot.remainingPoints)}" r="6" fill="#852d4d"><title>${escape(snapshot.date)}: ${snapshot.remainingPoints} points remaining</title></circle>`);
}
const current = snapshots.at(-1);
parts.push(`<text x="${x(current.date)}" y="${y(current.remainingPoints) - 15}" font-size="14" text-anchor="middle" fill="#852d4d">${current.remainingPoints} remaining</text>`,
  '<line x1="85" y1="432" x2="125" y2="432" stroke="#9a9fa8" stroke-width="2.5" stroke-dasharray="8 6"/>',
  '<text x="135" y="437" font-size="13">Ideal (calendar days; includes weekends/holiday)</text>',
  '<circle cx="525" cy="432" r="5" fill="#852d4d"/>',
  '<text x="540" y="437" font-size="13">Actual observations</text>',
  '<text x="85" y="470" font-size="13">Missing earlier snapshots are left blank. In review / In progress do not count as Done.</text>',
  `<text x="85" y="490" font-size="12" fill="#756770">Latest observation: ${escape(current.recordedAt)} (UTC)</text>`,
  '</g></svg>');
writeFileSync(resolve(docDir, 'sprint1-burndown.svg'), `${parts.join('\n')}\n`);
const summary = `# Sprint 1 — Burndown Chart

![Sprint 1 burndown](sprint1-burndown.svg)

Sprint: **5–18 November 2026**. Baseline: **16 story points** from US01–US04 in [PRODUCT_BACKLOG.md](../PRODUCT_BACKLOG.md). Status source: [GitHub Kanban](https://github.com/users/phangsx25/projects/1).

## Latest observed status — ${current.date}

| Story | Points | Status | Completed points |
| --- | --- | --- | --- |
${current.stories.map(story => `| [${story.id}](${story.url}) | ${story.points} | ${story.status} | ${story.status === 'Done' ? story.points : 0} |`).join('\n')}
| **Total** | **${total}** | | **${current.completedPoints}** |

**Remaining: ${current.remainingPoints} points.** In progress and In review do not burn points. A flat actual result does not mean no development occurred: whole-story completion is counted only when the card reaches Done. The chart reads board status; it does not independently certify acceptance criteria.

## Daily observations

| Date (Kuala Lumpur) | Completed | Remaining |
| --- | --- | --- |
${snapshots.map(snapshot => `| ${snapshot.date} | ${snapshot.completedPoints} | ${snapshot.remainingPoints} |`).join('\n')}

Earlier daily values are unknown, so no historical actual values are invented. The dashed ideal line declines linearly from 16 to 0 over calendar days, including weekends and the holiday; it is a reference, not reported work. Missing observations are not interpolated. Future actual progress is not plotted.

## Update

After changing Kanban statuses, run from the repository root:

\`\`\`powershell
node scripts/update-burndown.mjs
\`\`\`

Requires Node.js and GitHub CLI signed in with project read access. If gh is absent from the terminal PATH, set THENFRAME_GH_PATH to its executable path. A new day or changed story status appends an observation to [sprint1-burndown.json](sprint1-burndown.json); unchanged same-day runs do not add duplicates. The displayed daily value uses the last observation that day. Outside Sprint 1, history is preserved without adding observations. The script does not modify GitHub cards. [Automatic sync setup](../BURNDOWN_SYNC.md) explains the hourly workflow, required secret and activation steps.
`;
writeFileSync(resolve(docDir, 'sprint1-burndown.md'), summary);
console.log(`Sprint 1: ${done}/${total} Done, ${total - done} remaining (${localDate}). Chart: docs/sprint-1/sprint1-burndown.svg`);
