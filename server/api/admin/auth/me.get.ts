import { fail, ok } from "../../../utils/api";
import { getAdminSession } from "../../../utils/auth";

export default defineEventHandler((event) => {
  const session = getAdminSession(event);
  if (!session) {
    return fail("Unauthorized", 401);
  }

  return ok(session.user);
});
