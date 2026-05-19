import { getCatalogState } from "../../utils/catalog";
import { ok } from "../../utils/api";
import { requireAdminSession } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  requireAdminSession(event);
  return ok(await getCatalogState());
});
