import type { CatalogRecord, ImportResult } from "../../../../types/admin";
import { fail, ok } from "../../../utils/api";
import { getCatalogState, isCatalogCategory, normalizeRecord, saveCatalogState, validateRecord } from "../../../utils/catalog";

export default defineEventHandler(async (event) => {
  const category = String(getRouterParam(event, "category"));
  if (!isCatalogCategory(category)) {
    return fail(`Unknown category: ${category}`, 404);
  }

  const payload = await readBody<{ rows?: Record<string, unknown>[] }>(event);
  const rows = payload.rows ?? [];
  const result: ImportResult = { total: rows.length, success: 0, failed: 0, errors: [] };
  const validRecords: CatalogRecord[] = [];

  rows.forEach((row, index) => {
    const record = normalizeRecord(category, row);
    const error = validateRecord(category, record);
    if (error) {
      result.failed += 1;
      result.errors.push({ row: index + 2, message: error });
      return;
    }

    result.success += 1;
    validRecords.push(record);
  });

  if (validRecords.length) {
    const state = await getCatalogState();
    const list = state[category] as CatalogRecord[];
    const incomingIds = new Set(validRecords.map((item) => item.id));
    state[category] = [...validRecords, ...list.filter((item) => !incomingIds.has(item.id))] as never;
    await saveCatalogState(state);
  }

  return ok(result, result.failed ? 207 : 200);
});
