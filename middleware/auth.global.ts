import type { ApiResponse, AdminUser } from "~/types/admin";

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/login") {
    return;
  }

  const response = await $fetch<ApiResponse<AdminUser>>("/api/admin/auth/me").catch(() => null);
  if (!response?.Data) {
    return navigateTo("/login");
  }
});
