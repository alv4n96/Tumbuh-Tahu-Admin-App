import { fail, ok } from "../../../utils/api";
import { getCatalogState, isCatalogCategory } from "../../../utils/catalog";

export default defineEventHandler(async (event) => {
  const category = String(getRouterParam(event, "category"));
  if (!isCatalogCategory(category)) {
    return fail(`Unknown category: ${category}`, 404);
  }

  const state = await getCatalogState();
  return ok(state[category]);
});
