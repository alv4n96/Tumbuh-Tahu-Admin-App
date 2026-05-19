<script setup lang="ts">
import { Loader2, ShieldCheck } from "lucide-vue-next";
import type { AdminUser, ApiResponse } from "~/types/admin";

definePageMeta({
  layout: false
});

const email = ref("owner@tumbuhtahu.test");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

async function login() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const response = await $fetch<ApiResponse<AdminUser>>("/api/admin/auth/login", {
      method: "POST",
      body: { email: email.value, password: password.value }
    });
    if (response.Error || !response.Data) {
      throw new Error(String(response.Error || "Login gagal."));
    }
    await navigateTo("/");
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Login gagal.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="login-shell">
    <section class="login-panel">
      <div class="brand">
        <span class="brand-mark">TT</span>
        <div>
          <strong>Tumbuh Tahu</strong>
          <small>Admin Control</small>
        </div>
      </div>

      <div class="login-heading">
        <ShieldCheck :size="34" />
        <h1>Admin Login</h1>
      </div>

      <form class="record-form" @submit.prevent="login">
        <label>
          <span>Email</span>
          <input v-model="email" type="email" autocomplete="email" required />
        </label>
        <label>
          <span>Password</span>
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <button class="primary-button" type="submit" :disabled="loading">
          <Loader2 v-if="loading" class="spin" :size="18" />
          <span>{{ loading ? "Checking" : "Masuk Admin" }}</span>
        </button>
      </form>
    </section>
  </main>
</template>
