import { fail, ok } from "../../../utils/api";
import { findSeedAdmin, getSeedPassword, setAdminSession } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event);
  const email = String(body.email || "").trim();
  const password = String(body.password || "");
  const user = findSeedAdmin(email);

  if (!user || password !== getSeedPassword()) {
    return fail("Email atau password admin tidak valid.", 401);
  }

  setAdminSession(event, user);
  return ok(user);
});
