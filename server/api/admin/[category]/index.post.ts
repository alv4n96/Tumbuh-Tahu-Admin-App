import type { CatalogRecord } from "../../../../types/admin";
import { fail, ok } from "../../../utils/api";
import { isCatalogCategory, normalizeRecord, upsertCatalogRecord, validateRecord } from "../../../utils/catalog";
import { requireAdminSession } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  requireAdminSession(event);
  const category = String(getRouterParam(event, "category"));
  if (!isCatalogCategory(category)) {
    return fail(`Unknown category: ${category}`, 404);
  }

  const payload = await readBody<Record<string, unknown>>(event);
  const record = normalizeRecord(category, payload, { preserveEmptyId: true });
  const error = validateRecord(category, record);
  if (error) {
    return fail(error, 422);
  }

  await upsertCatalogRecord(category, record);
  return ok(record, 201);
});
