import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'thenframe-sync-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'scripts'));
  mkdirSync(join(root, 'docs'));
  for (const name of ['sync-kanban.mjs', 'update-burndown.mjs']) {
    copyFileSync(join(repo, 'scripts', name), join(root, 'scripts', name));
  }
  writeFileSync(join(root, 'docs/KANBAN.md'), '# Initial snapshot\n');
  const board = { totalCount: 13, items: Array.from({ length: 13 }, (_, i) => ({
    title: `US${String(i + 1).padStart(2, '0')} — Story`, status: i < 4 ? 'In review' : 'Backlog',
    content: { url: `https://github.com/phangsx25/AppDev_G03_AppForge_ThenFrame/issues/${i + 1}` },
  })) };
  const run = (date = '2026-11-14T12:00:00Z') => {
    writeFileSync(join(root, 'board.json'), JSON.stringify(board));
    // Freeze the test process and inherited child-process clock.
    const clock = join(root, 'clock.mjs');
    writeFileSync(clock, `const OriginalDate = Date; globalThis.Date = class extends OriginalDate { constructor(...args) { super(...(args.length ? args : [${JSON.stringify(date)}])); } static now() { return new OriginalDate(${JSON.stringify(date)}).getTime(); } };`);
    return spawnSync(process.execPath, [join(root, 'scripts/sync-kanban.mjs'), '--input', join(root, 'board.json')], {
      encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: `--import=${pathToFileURL(clock).href}` },
    });
  };
  const read = name => readFileSync(join(root, 'docs', name), 'utf8');
  return { board, run, read };
}

test('same-day unchanged sync is idempotent; Done and reopened cards update remaining points', t => {
  const f = fixture(t);
  let result = f.run();
  assert.equal(result.status, 0, result.stderr);
  const first = f.read('sprint1-burndown.json');
  const markdown = f.read('KANBAN.md');
  result = f.run('2026-11-14T13:00:00Z');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(f.read('sprint1-burndown.json'), first);
  assert.equal(f.read('KANBAN.md'), markdown);
  f.board.items[0].status = 'Done';
  result = f.run('2026-11-14T14:00:00Z');
  assert.equal(result.status, 0, result.stderr);
  let history = JSON.parse(f.read('sprint1-burndown.json'));
  assert.equal(history.snapshots.at(-1).remainingPoints, 13);
  assert.equal(history.snapshots.length, 2);
  f.board.items[0].status = 'In review';
  result = f.run('2026-11-15T14:00:00Z');
  assert.equal(result.status, 0, result.stderr);
  history = JSON.parse(f.read('sprint1-burndown.json'));
  assert.equal(history.snapshots.at(-1).remainingPoints, 16);
  assert.equal(history.snapshots[0].date, '2026-11-14');
  assert.ok(!history.snapshots.some(s => s.date < '2026-11-14'));
});

test('incomplete input fails without publishing a partial snapshot', t => {
  const f = fixture(t);
  assert.equal(f.run().status, 0);
  const before = f.read('KANBAN.md');
  const history = f.read('sprint1-burndown.json');
  f.board.items.pop();
  assert.notEqual(f.run().status, 0);
  assert.equal(f.read('KANBAN.md'), before);
  assert.equal(f.read('sprint1-burndown.json'), history);
});

test('after Sprint 1 ends Kanban continues updating while burndown history is frozen', t => {
  const f = fixture(t);
  assert.equal(f.run().status, 0);
  const history = f.read('sprint1-burndown.json');
  f.board.items[0].status = 'Done';
  const result = f.run('2026-11-19T12:00:00Z');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(f.read('sprint1-burndown.json'), history);
  assert.match(f.read('KANBAN.md'), /\*\*13\/16 points remaining\*\*/);
});
