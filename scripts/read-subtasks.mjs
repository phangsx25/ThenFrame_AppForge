import { execFileSync } from 'node:child_process';

// Sprint 1 subtasks live as issues in this public repository, titled
// "US0x: <story> | <task> (<owner>)". Reading them needs no extra token scope.
const repo = 'phangsx25/ThenFrame_AppForge';
const storyPrefix = /^(US0[1-4]):/;

export function readSubtasks(gh = 'gh', execute = execFileSync) {
  const issues = [];
  for (let page = 1; ; page++) {
    const batch = JSON.parse(execute(gh, ['api', `repos/${repo}/issues?state=all&per_page=100&page=${page}`],
      { encoding: 'utf8' }));
    if (!Array.isArray(batch)) throw new Error('Subtask issue query failed; no snapshot saved');
    issues.push(...batch);
    if (batch.length < 100) break;
  }
  return issues
    .filter(issue => !issue.pull_request && storyPrefix.test(issue.title))
    .map(issue => ({
      story: issue.title.match(storyPrefix)[1],
      number: issue.number,
      closedAt: issue.state === 'closed' ? issue.closed_at : null,
    }))
    .sort((a, b) => a.number - b.number);
}
