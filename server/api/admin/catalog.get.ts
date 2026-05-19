import { getCatalogState } from "../../utils/catalog";
import { ok } from "../../utils/api";

export default defineEventHandler(async () => {
  return ok(await getCatalogState());
});
