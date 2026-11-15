import { execFileSync } from 'node:child_process';

// Query the known personal owner directly. `gh project` owner discovery can
// fail even when a least-privilege token can read user.projectV2 successfully.
const query = `query($login: String!, $cursor: String) {
  user(login: $login) {
    projectV2(number: 1) {
      items(first: 100, after: $cursor) {
        totalCount
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          fieldValueByName(name: "Status") {
            ... on ProjectV2ItemFieldSingleSelectValue { name }
          }
        }
      }
    }
  }
}`;

export function readProject(gh = 'gh', execute = execFileSync) {
  const items = [], cursors = new Set();
  let cursor, totalCount;
  do {
    const args = ['api', 'graphql', '-f', `query=${query}`, '-f', 'login=phangsx25'];
    if (cursor) args.push('-f', `cursor=${cursor}`);
    const response = JSON.parse(execute(gh, args, { encoding: 'utf8' }));
    if (response.errors?.length) throw new Error('GitHub Project query failed; no snapshot saved');
    const page = response.data?.user?.projectV2?.items;
    if (!page || !Array.isArray(page.nodes) || !Number.isInteger(page.totalCount))
      throw new Error('Project 1 is inaccessible or incomplete; no snapshot saved');
    if (totalCount !== undefined && totalCount !== page.totalCount)
      throw new Error('Project changed during pagination; retry before saving');
    totalCount = page.totalCount;
    items.push(...page.nodes.map(item => ({
      id: item.id,
      status: item.fieldValueByName?.name,
    })));
    cursor = page.pageInfo?.hasNextPage ? page.pageInfo.endCursor : undefined;
    if (page.pageInfo?.hasNextPage && (!cursor || cursors.has(cursor)))
      throw new Error('Invalid Project pagination; no snapshot saved');
    if (cursor) cursors.add(cursor);
  } while (cursor);
  if (items.length !== totalCount || new Set(items.map(item => item.id)).size !== items.length)
    throw new Error('Incomplete or duplicated Project response; no snapshot saved');
  return { items, totalCount };
}
