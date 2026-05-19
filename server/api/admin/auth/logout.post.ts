import { ok } from "../../../utils/api";
import { clearAdminSession } from "../../../utils/auth";

export default defineEventHandler((event) => {
  clearAdminSession(event);
  return ok({ loggedOut: true });
});
