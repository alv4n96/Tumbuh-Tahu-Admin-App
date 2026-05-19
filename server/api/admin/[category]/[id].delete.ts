import { fail, ok } from "../../../utils/api";
import { deleteCatalogRecord, isCatalogCategory } from "../../../utils/catalog";
import { requireAdminSession } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  requireAdminSession(event);
  const category = String(getRouterParam(event, "category"));
  const id = String(getRouterParam(event, "id"));
  if (!isCatalogCategory(category)) {
    return fail(`Unknown category: ${category}`, 404);
  }

  await deleteCatalogRecord(category, id);
  return ok({ id });
});
