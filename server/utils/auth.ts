import { createHmac, timingSafeEqual } from "node:crypto";
import type { H3Event } from "h3";
import { adminUsers, getSupabaseAdmin, getSupabasePublicClient, requireDatabaseInThisEnvironment } from "./catalog";
import type { AdminUser } from "../../types/admin";

const cookieName = "tt_admin_session";
const maxAge = 60 * 60 * 8;

type AdminSession = {
  user: AdminUser;
  exp: number;
};

export function getSeedPassword() {
  return String(useRuntimeConfig().adminSeedPassword);
}

export function findSeedAdmin(email: string) {
  return adminUsers.find((user) => user.active && user.email.toLowerCase() === email.toLowerCase());
}

export async function loginAdmin(email: string, password: string) {
  const supabaseAuth = getSupabasePublicClient();
  const supabaseAdmin = getSupabaseAdmin();

  if (supabaseAuth && supabaseAdmin) {
    const { data: signInData, error: signInError } = await supabaseAuth.auth.signInWithPassword({ email, password });
    if (signInError || !signInData.user) {
      return null;
    }

    const { data: roleRows, error: roleError } = await supabaseAdmin
      .from("app_roles")
      .select("role")
      .eq("user_id", signInData.user.id);

    if (roleError || !roleRows?.length) {
      return null;
    }

    const role = roleRows.some((row) => row.role === "owner")
      ? "owner"
      : roleRows.some((row) => row.role === "admin")
        ? "admin"
        : "editor";

    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("full_name")
      .eq("id", signInData.user.id)
      .maybeSingle();

    return {
      id: signInData.user.id,
      email: signInData.user.email ?? email,
      fullName: profile?.full_name ?? signInData.user.user_metadata?.full_name ?? "Admin User",
      role,
      active: true
    } satisfies AdminUser;
  }

  if (requireDatabaseInThisEnvironment()) {
    throw createError({
      statusCode: 500,
      statusMessage: "Supabase Auth env is required in production. Set NUXT_PUBLIC_SUPABASE_URL, NUXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY."
    });
  }

  const seedUser = findSeedAdmin(email);
  if (!seedUser || password !== getSeedPassword()) {
    return null;
  }
  return seedUser;
}

export function setAdminSession(event: H3Event, user: AdminUser) {
  const session: AdminSession = {
    user,
    exp: Date.now() + maxAge * 1000
  };
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const signature = sign(payload);
  setCookie(event, cookieName, `${payload}.${signature}`, {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export function clearAdminSession(event: H3Event) {
  deleteCookie(event, cookieName, { path: "/" });
}

export function getAdminSession(event: H3Event) {
  const raw = getCookie(event, cookieName);
  if (!raw) {
    return null;
  }

  const [payload, signature] = raw.split(".");
  if (!payload || !signature || !verify(payload, signature)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (session.exp < Date.now() || !session.user.active) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function requireAdminSession(event: H3Event) {
  const session = getAdminSession(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  return session;
}

function sign(payload: string) {
  return createHmac("sha256", String(useRuntimeConfig().adminSessionSecret)).update(payload).digest("base64url");
}

function verify(payload: string, signature: string) {
  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}
