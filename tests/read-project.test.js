import { describe, expect, it, vi } from 'vitest';
import { readProject } from '../scripts/read-project.mjs';

const node = (id) => ({ id, content: { title: id, url: `https://example.test/${id}` }, fieldValueByName: { name: 'In review' } });
const page = (nodes, totalCount, hasNextPage = false, endCursor = null) => JSON.stringify({
  data: { user: { projectV2: { items: { nodes, totalCount, pageInfo: { hasNextPage, endCursor } } } } },
});
describe('read-only Project API pagination', () => {
  it('aggregates pages and preserves story titles, statuses and links', () => {
    const execute = vi.fn().mockReturnValueOnce(page([node('US01')], 2, true, 'next'))
      .mockReturnValueOnce(page([node('US02')], 2));
    const board = readProject('gh', execute);
    expect(board.items.map(item => item.title)).toEqual(['US01', 'US02']);
    expect(board.items[0]).toMatchObject({ status: 'In review', content: { url: 'https://example.test/US01' } });
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
