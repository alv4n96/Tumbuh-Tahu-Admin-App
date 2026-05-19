import { fail } from "../../../utils/api";
import { isCatalogCategory, templates } from "../../../utils/catalog";
import { requireAdminSession } from "../../../utils/auth";

export default defineEventHandler((event) => {
  requireAdminSession(event);
  const category = String(getRouterParam(event, "category"));
  if (!isCatalogCategory(category)) {
    return fail(`Unknown category: ${category}`, 404);
  }

  setHeader(event, "content-type", "text/csv; charset=utf-8");
  setHeader(event, "content-disposition", `attachment; filename=\"${category}-template.csv\"`);
  return `${templates[category].join(",")}\n`;
});
