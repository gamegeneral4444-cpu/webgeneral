const EXCLUDED_PREFIXES = ["/admin", "/api", "/login", "/_next"];

export function normalizeAnalyticsPath(input: unknown): string | null {
  if (typeof input !== "string" || !input.startsWith("/") || input.startsWith("//")) return null;
  const path = input.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  if (path.length > 300 || EXCLUDED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return null;
  return /^\/[A-Za-z0-9/_-]*$/.test(path) ? path : null;
}
