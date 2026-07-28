export const PUBLISHED_STATUS = "published";

type VisibilityQuery<TQuery> = {
  eq(column: string, value: string): TQuery;
};

/**
 * Studio mode is the internal production view and does not restrict status.
 * Public mode only returns records whose status column is published.
 */
export function applyContentVisibility<TQuery extends VisibilityQuery<TQuery>>(
  query: TQuery,
  studioModeEnabled: boolean,
  statusColumn = "content_status"
): TQuery {
  return studioModeEnabled ? query : query.eq(statusColumn, PUBLISHED_STATUS);
}

/**
 * Content types such as planning blocks are Studio-only until a public
 * presentation is deliberately designed for them.
 */
export function isStudioOnlyContentVisible(studioModeEnabled: boolean): boolean {
  return studioModeEnabled;
}
