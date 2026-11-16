// Project item IDs are not credentials. These four IDs were checked against
// their story titles with the owner's existing login. Issue content stays private.
const items = {
  US01: 'PVTI_lAHOC4Vg684BqIppzhJFVVM',
  US02: 'PVTI_lAHOC4Vg684BqIppzhJFVnE',
  US03: 'PVTI_lAHOC4Vg684BqIppzhJFV4I',
  US04: 'PVTI_lAHOC4Vg684BqIppzhJFWIY',
};
export const points = { US01: 3, US02: 3, US03: 5, US04: 5 };
export function sprint1Stories(board) {
  return Object.entries(points).map(([id, estimate], index) => {
    const matches = board.items.filter(item => item.id === items[id]);
    if (matches.length !== 1 || !matches[0].status)
      throw new Error(`Expected one Project item with status for ${id}; check the configured item ID before saving`);
    return {
      id, points: estimate, status: matches[0].status,
      url: `https://github.com/phangsx25/AppDev_G03_AppForge_ThenFrame/issues/${index + 1}`,
    };
  });
}
