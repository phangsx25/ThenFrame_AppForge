import { readProject } from './read-project.mjs';
import { readSubtasks } from './read-subtasks.mjs';
import { points, sprint1Stories } from './sprint1-stories.mjs';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Read-only GitHub access. No project fields or issue statuses are modified.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docDir = resolve(root, 'docs/sprint-1');
const dataPath = resolve(docDir, 'sprint1-burndown.json');
const argValue = flag => {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  if (!process.argv[index + 1]) throw new Error(`${flag} requires a JSON file`);
  return process.argv[index + 1];
};
const readJson = path => JSON.parse(readFileSync(path, 'utf8').replace(/^﻿/, ''));
const boardFile = argValue('--input');
const subtaskFile = argValue('--subtasks');
const gh = process.env.THENFRAME_GH_PATH || 'gh';
const board = boardFile ? readJson(boardFile) : readProject(gh);
if (!Array.isArray(board.items) || board.items.length < board.totalCount) {
  throw new Error('Incomplete project response; no snapshot saved');
}
const stories = sprint1Stories(board);
const now = new Date();
const kualaLumpur = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit',
});
const klDate = value => kualaLumpur.format(new Date(value));
const localDate = klDate(now);
const start = '2026-11-05';
const end = '2026-11-18';
if (localDate < start || localDate > end) {
  console.log('Outside Sprint 1: historical burndown preserved; no observation added.');
  process.exit(0);
}
const subtasks = subtaskFile ? readJson(subtaskFile) : readSubtasks(gh);
const subtaskCount = Object.fromEntries(Object.keys(points)
  .map(id => [id, subtasks.filter(task => task.story === id).length]));
for (const [id, count] of Object.entries(subtaskCount)) {
  if (!count) throw new Error(`No subtasks found for ${id}; no snapshot saved`);
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
// Record story statuses daily and on change, without hourly duplicate commits.
const previous = history.snapshots.at(-1);
if (!previous || previous.date !== localDate || JSON.stringify(previous.stories) !== JSON.stringify(stories)) {
  history.snapshots.push({ date: localDate, recordedAt: now.toISOString(),
    completedPoints: done, remainingPoints: total - done, stories });
}

// Burn each story's points evenly across its subtasks, on the day (Kuala Lumpur
// time) each subtask was closed on GitHub. Plotted from the first board observation.
const dayMs = 86400000;
const dateMs = value => Date.parse(`${value}T00:00:00Z`);
const nextDate = value => new Date(dateMs(value) + dayMs).toISOString().slice(0, 10);
const round = value => Math.round(value * 10) / 10;
const closedBy = date => subtasks.filter(task => task.closedAt && klDate(task.closedAt) <= date);
const series = [];
for (let date = history.snapshots[0].date; date <= localDate; date = nextDate(date)) {
  const closed = closedBy(date);
  const burned = closed.reduce((sum, task) => sum + points[task.story] / subtaskCount[task.story], 0);
  series.push({ date, closedSubtasks: closed.length, completedPoints: round(burned),
    remainingPoints: round(total - burned) });
}
history.method = "Story points split evenly across each story's subtasks; a subtask burns its share on the day it is closed (Kuala Lumpur time).";
history.subtasks = subtasks;
history.subtaskBurndown = series;
mkdirSync(docDir, { recursive: true });
writeFileSync(dataPath, `${JSON.stringify(history, null, 2)}\n`);

const days = (dateMs(end) - dateMs(start)) / dayMs;
const x = date => 85 + ((dateMs(date) - dateMs(start)) / dayMs / days) * 840;
const y = value => 370 - (value / total) * 260;
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[char]);
const parts = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="1020" height="510" viewBox="0 0 1020 510" role="img" aria-labelledby="title desc">',
  '<title id="title">ThenFrame Sprint 1 Burndown</title>',
  `<desc id="desc">${total} story points across US01 to US04, burned as subtasks close. Dashed ideal line is a calendar-day reference.</desc>`,
  '<rect width="1020" height="510" rx="16" fill="#fffaf8"/>',
  '<g font-family="Arial, sans-serif" fill="#35262c">',
  '<text x="45" y="42" font-size="25" font-weight="bold">ThenFrame / Sprint 1 Burndown</text>',
  `<text x="45" y="68" font-size="14">5–18 Nov 2026 · ${total} points · ${subtasks.length} subtasks · Kuala Lumpur time</text>`,
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
  `<line x1="${x(start)}" y1="${y(total)}" x2="${x(end)}" y2="${y(0)}" stroke="#9a9fa8" stroke-width="2.5" stroke-dasharray="8 6"/>`,
  `<polyline points="${series.map(point => `${x(point.date)},${y(point.remainingPoints)}`).join(' ')}" fill="none" stroke="#852d4d" stroke-width="3"/>`);
for (const point of series) {
  parts.push(`<circle cx="${x(point.date)}" cy="${y(point.remainingPoints)}" r="6" fill="#852d4d"><title>${escape(point.date)}: ${point.remainingPoints} points remaining, ${point.closedSubtasks}/${subtasks.length} subtasks closed</title></circle>`);
}
const current = series.at(-1);
parts.push(`<text x="${Math.min(x(current.date), 880)}" y="${y(current.remainingPoints) - 15}" font-size="14" text-anchor="middle" fill="#852d4d">${current.remainingPoints} remaining</text>`,
  '<line x1="85" y1="432" x2="125" y2="432" stroke="#9a9fa8" stroke-width="2.5" stroke-dasharray="8 6"/>',
  '<text x="135" y="437" font-size="13">Ideal (calendar days; includes weekends/holiday)</text>',
  '<circle cx="525" cy="432" r="5" fill="#852d4d"/>',
  '<text x="540" y="437" font-size="13">Actual (subtask close dates)</text>',
  "<text x=\"85\" y=\"470\" font-size=\"13\">Each story's points are split evenly across its subtasks. Days before the first board observation are not plotted.</text>",
  `<text x="85" y="490" font-size="12" fill="#756770">Latest observation: ${escape(now.toISOString())} (UTC)</text>`,
  '</g></svg>');
writeFileSync(resolve(docDir, 'sprint1-burndown.svg'), `${parts.join('\n')}\n`);

const storyRows = stories.map(story => {
  const closed = closedBy(localDate).filter(task => task.story === story.id).length;
  const burned = round(story.points * closed / subtaskCount[story.id]);
  return `| [${story.id}](${story.url}) | ${story.points} | ${story.status} | ${closed}/${subtaskCount[story.id]} | ${burned} |`;
});
const summary = `# Sprint 1 — Burndown Chart

![Sprint 1 burndown](sprint1-burndown.svg)

Sprint: **5–18 November 2026**. Baseline: **${total} story points** from US01–US04 in [PRODUCT_BACKLOG.md](../PRODUCT_BACKLOG.md). Sources: story status from the [GitHub Kanban](https://github.com/users/phangsx25/projects/1); subtask close dates from this repository's issues.

## How points burn

Each story's points are split evenly across its subtasks. When a subtask issue is closed, its share is burned on that day (Kuala Lumpur time). For example, US03 has 5 points and 7 subtasks, so each closed subtask burns about 0.7 points. The chart therefore moves as work inside a story finishes, not only when the whole story reaches Done.

## Latest status — ${localDate}

| Story | Points | Kanban status | Subtasks closed | Points burned |
| --- | --- | --- | --- | --- |
${storyRows.join('\n')}
| **Total** | **${total}** | | **${current.closedSubtasks}/${subtasks.length}** | **${current.completedPoints}** |

**Remaining: ${current.remainingPoints} points.**

## Daily values

| Date (Kuala Lumpur) | Subtasks closed | Completed | Remaining |
| --- | --- | --- | --- |
${series.map(point => `| ${point.date} | ${point.closedSubtasks}/${subtasks.length} | ${point.completedPoints} | ${point.remainingPoints} |`).join('\n')}

Values come from the dates subtasks were closed on GitHub, so they show when the board was updated, which can be later than when the work was done. Days before the first board observation (${series[0].date}) are not plotted. The dashed ideal line declines linearly from ${total} to 0 over calendar days, including weekends and the holiday; it is a reference, not reported work.

## Update

After changing Kanban statuses or closing subtasks, run from the repository root:

\`\`\`powershell
node scripts/update-burndown.mjs
\`\`\`

Requires Node.js and GitHub CLI signed in with project read access. If gh is absent from the terminal PATH, set THENFRAME_GH_PATH to its executable path. Story statuses and subtask close dates are saved in [sprint1-burndown.json](sprint1-burndown.json); unchanged same-day runs produce the same file. Outside Sprint 1, history is preserved without adding observations. The script does not modify GitHub cards or issues. [Automatic sync setup](../BURNDOWN_SYNC.md) explains the hourly workflow, required secret and activation steps.
`;
writeFileSync(resolve(docDir, 'sprint1-burndown.md'), summary);
console.log(`Sprint 1: ${current.closedSubtasks}/${subtasks.length} subtasks closed, ${current.remainingPoints} of ${total} points remaining (${localDate}). Chart: docs/sprint-1/sprint1-burndown.svg`);
