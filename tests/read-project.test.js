import { describe, expect, it, vi } from 'vitest';
import { readProject } from '../scripts/read-project.mjs';
import { sprint1Stories } from '../scripts/sprint1-stories.mjs';

const node = (id) => ({ id, content: { title: id, url: `https://example.test/${id}` }, fieldValueByName: { name: 'In review' } });
const page = (nodes, totalCount, hasNextPage = false, endCursor = null) => JSON.stringify({
  data: { user: { projectV2: { items: { nodes, totalCount, pageInfo: { hasNextPage, endCursor } } } } },
});
describe('read-only Project API pagination', () => {
  it('aggregates pages and reads only Project item IDs and statuses', () => {
    const execute = vi.fn().mockReturnValueOnce(page([node('US01')], 2, true, 'next'))
      .mockReturnValueOnce(page([node('US02')], 2));
    const board = readProject('gh', execute);
    expect(board.items.map(item => item.id)).toEqual(['US01', 'US02']);
    expect(board.items[0]).toEqual({ id: 'US01', status: 'In review' });
    expect(execute.mock.calls[0][1].find(arg => arg.startsWith('query='))).not.toContain('content');
    expect(execute.mock.calls[1][1]).toContain('cursor=next');
    expect(execute.mock.calls[0][1]).not.toContain('project');
  });
  it.each([
    JSON.stringify({ data: { user: { projectV2: null } } }),
    JSON.stringify({ errors: [{ message: 'Denied' }] }),
    page([node('US01')], 2),
    page([node('US01'), node('US01')], 2),
    page([node('US01')], 1, true, null),
  ])('rejects inaccessible, incomplete or duplicated results', (response) => {
    expect(() => readProject('gh', () => response)).toThrow();
  });
  it('rejects a changed item count between pages', () => {
    const execute = vi.fn().mockReturnValueOnce(page([node('US01')], 2, true, 'next'))
      .mockReturnValueOnce(page([node('US02')], 3));
    expect(() => readProject('gh', execute)).toThrow(/changed/);
  });
});

describe('Sprint 1 fixed Project items', () => {
  const ids = ['PVTI_lAHOC4Vg684BqIppzhJFVVM', 'PVTI_lAHOC4Vg684BqIppzhJFVnE',
    'PVTI_lAHOC4Vg684BqIppzhJFV4I', 'PVTI_lAHOC4Vg684BqIppzhJFWIY'];
  const board = () => ({ items: ids.map(id => ({ id, status: 'In review' })) });
  it('maps private issues without needing their content or titles', () => {
    const stories = sprint1Stories(board());
    expect(stories.map(story => story.id)).toEqual(['US01', 'US02', 'US03', 'US04']);
    expect(stories.reduce((sum, story) => sum + story.points, 0)).toBe(16);
    expect(stories[0].url).toMatch(/issues\/1$/);
  });
  it('does not guess a missing, duplicated or statusless story', () => {
    for (const items of [board().items.slice(1), [...board().items, board().items[0]],
      board().items.map(item => ({ ...item, status: '' }))])
      expect(() => sprint1Stories({ items })).toThrow(/Expected one Project item/);
  });
});
