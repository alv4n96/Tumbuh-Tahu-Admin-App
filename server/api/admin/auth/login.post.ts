import { fail, ok } from "../../../utils/api";
import { loginAdmin, setAdminSession } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: string }>(event);
  const password = String(body.password || "");
  const user = loginAdmin(password);
  if (!user) {
    return fail("Password admin tidak valid.", 401);
  }

  setAdminSession(event, user);
  return ok(user);
});
