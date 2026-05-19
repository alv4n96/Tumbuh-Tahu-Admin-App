import type { CatalogRecord } from "../../../../types/admin";
import { fail, ok } from "../../../utils/api";
import { getCatalogState, isCatalogCategory, saveCatalogState } from "../../../utils/catalog";

export default defineEventHandler(async (event) => {
  const category = String(getRouterParam(event, "category"));
  const id = String(getRouterParam(event, "id"));
  if (!isCatalogCategory(category)) {
    return fail(`Unknown category: ${category}`, 404);
  }

  const state = await getCatalogState();
  const list = state[category] as CatalogRecord[];
  state[category] = list.filter((item) => item.id !== id) as never;
  await saveCatalogState(state);
  return ok({ id });
});
