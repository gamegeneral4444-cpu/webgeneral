export const CATEGORY_CONFIG = {
  news_categories: { foreignTable: "news", publicPath: "/news", label: "ข่าว" },
  document_categories: { foreignTable: "documents", publicPath: "/downloads", label: "เอกสาร" },
  service_categories: { foreignTable: "services", publicPath: "/services", label: "บริการ" },
} as const;

export type CategoryTable = keyof typeof CATEGORY_CONFIG;

export function isCategoryTable(value: string): value is CategoryTable {
  return Object.hasOwn(CATEGORY_CONFIG, value);
}
