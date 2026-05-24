<script setup lang="ts">
import { Shield } from "lucide-vue-next";
import { adminNavItems } from "~/utils/catalogConfig";

defineProps<{
  activePath?: string;
  adminSummary: string;
  subtitle?: string;
}>();
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <span class="brand-mark">TT</span>
      <div>
        <strong>Tumbuh Tahu</strong>
        <small>{{ subtitle || "Admin Control" }}</small>
      </div>
    </div>

    <nav class="nav-list" aria-label="Admin navigation">
      <NuxtLink v-for="item in adminNavItems" :key="item.path" class="nav-item nav-link" :class="{ active: activePath === item.path || activePath === item.key }" :to="item.path">
        <component :is="item.icon" :size="18" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="access-panel">
      <Shield :size="18" />
      <div>
        <strong>{{ adminSummary }}</strong>
        <small>Multi-admin access ready</small>
      </div>
    </div>
  </aside>
</template>
