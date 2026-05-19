import { fail, ok } from "../../../utils/api";
import { loginAdmin, setAdminSession } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event);
  const email = String(body.email || "").trim();
  const password = String(body.password || "");
  const user = await loginAdmin(email, password);
  if (!user) {
    return fail("Email atau password admin tidak valid.", 401);
  }

  setAdminSession(event, user);
  return ok(user);
});
