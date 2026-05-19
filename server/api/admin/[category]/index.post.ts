import type { CatalogRecord } from "../../../../types/admin";
import { fail, ok } from "../../../utils/api";
import { getCatalogState, isCatalogCategory, normalizeRecord, saveCatalogState, validateRecord } from "../../../utils/catalog";

export default defineEventHandler(async (event) => {
  const category = String(getRouterParam(event, "category"));
  if (!isCatalogCategory(category)) {
    return fail(`Unknown category: ${category}`, 404);
  }

  const payload = await readBody<Record<string, unknown>>(event);
  const record = normalizeRecord(category, payload);
  const error = validateRecord(category, record);
  if (error) {
    return fail(error, 422);
  }

  const state = await getCatalogState();
  const list = state[category] as CatalogRecord[];
  state[category] = [record, ...list.filter((item) => item.id !== record.id)] as never;
  await saveCatalogState(state);
  return ok(record, 201);
});
