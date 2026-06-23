export function normalizeImageOrder(ids: string[]) {
  return ids.map((id, sort_order) => ({ id, sort_order }));
}
