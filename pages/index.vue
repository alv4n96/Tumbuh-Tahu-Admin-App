<script setup lang="ts">
import { Loader2, LogOut } from "lucide-vue-next";
import type { ApiResponse, CatalogState } from "~/types/admin";

const loading = ref(true);
const errorMessage = ref("");
const catalog = reactive<CatalogState>({
  milestones: [],
  education: [],
  activities: [],
  ageRanges: [],
  feedbackQuestions: [],
  adminUsers: [],
  users: [],
  feedback: []
});

const contentTotals = computed(() => ({
  milestones: catalog.milestones.length,
  education: catalog.education.length,
  activities: catalog.activities.length,
  feedbackQuestions: catalog.feedbackQuestions.length
}));
const activeTotals = computed(() => ({
  milestones: catalog.milestones.filter((item) => item.active).length,
  education: catalog.education.filter((item) => item.published).length,
  activities: catalog.activities.filter((item) => item.published).length,
  feedbackQuestions: catalog.feedbackQuestions.filter((item) => item.active).length
}));
const contentHealth = computed(() => {
  const total = contentTotals.value.milestones + contentTotals.value.education + contentTotals.value.activities + contentTotals.value.feedbackQuestions;
  const active = activeTotals.value.milestones + activeTotals.value.education + activeTotals.value.activities + activeTotals.value.feedbackQuestions;
  return total ? Math.round((active / total) * 100) : 0;
});
const averageFeedback = computed(() => {
  const values = catalog.feedback.flatMap((row) =>
    ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"].map((field) => Number((row as unknown as Record<string, number>)[field] || 0)).filter(Boolean)
  );
  return values.length ? (values.reduce((total, value) => total + value, 0) / values.length).toFixed(2) : "0";
});
const ageCoverage = computed(() =>
  catalog.ageRanges.map((age) => ({
    label: age.label,
    total:
      catalog.milestones.filter((item) => item.ageRange === age.label).length +
      catalog.education.filter((item) => item.ageRange === age.label).length +
      catalog.activities.filter((item) => item.ageRange === age.label).length
  }))
);
const recentFeedback = computed(() => catalog.feedback.slice(0, 5));
const adminSummary = computed(() => `${catalog.adminUsers.length} admin`);

onMounted(loadCatalog);

async function loadCatalog() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const response = await $fetch<ApiResponse<CatalogState>>("/api/admin/catalog");
    if (response.Error || !response.Data) {
      throw new Error(String(response.Error || "Failed to load catalog"));
    }
    Object.assign(catalog, response.Data);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Gagal memuat dashboard.";
  } finally {
    loading.value = false;
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

async function logout() {
  await $fetch("/api/admin/auth/logout", { method: "POST" });
  await navigateTo("/login");
}
</script>

<template>
  <main class="app-shell">
    <AdminSidebar active-path="/" :admin-summary="adminSummary" subtitle="Admin Dashboard" />

    <section class="workspace">
      <header class="topbar">
        <div>
          <p class="eyebrow">Business Analytics App</p>
          <h1>Dashboard</h1>
        </div>
        <button class="icon-button" type="button" title="Logout" @click="logout">
          <LogOut :size="18" />
        </button>
      </header>

      <div v-if="loading" class="state">
        <Loader2 class="spin" :size="22" />
        <span>Loading dashboard</span>
      </div>

      <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>

      <section v-else class="analysis-layout">
        <section class="metric-grid" aria-label="Admin metrics">
          <article class="metric">
            <span>Konten Aktif</span>
            <strong>{{ activeTotals.milestones + activeTotals.education + activeTotals.activities }}</strong>
            <small>Milestone, materi, dan stimulasi siap tampil</small>
          </article>
          <article class="metric">
            <span>Feedback Masuk</span>
            <strong>{{ catalog.feedback.length }}</strong>
            <small>Rata-rata rating {{ averageFeedback }}</small>
          </article>
          <article class="metric">
            <span>User Aplikasi</span>
            <strong>{{ catalog.users.length }}</strong>
            <small>{{ catalog.users.filter((item) => Boolean(item.lastLoginAt)).length }} pernah login</small>
          </article>
          <article class="metric">
            <span>Pertanyaan Aktif</span>
            <strong>{{ activeTotals.feedbackQuestions }}/{{ contentTotals.feedbackQuestions }}</strong>
            <small>Kontrol form feedback user</small>
          </article>
        </section>

        <section class="analysis-grid">
          <article class="panel dashboard-panel">
            <div class="panel-header">
              <div>
                <h2>Kesiapan Konten</h2>
                <p>Ringkasan data yang bisa tampil di aplikasi user.</p>
              </div>
              <strong>{{ contentHealth }}%</strong>
            </div>
            <div class="health-bar" aria-hidden="true">
              <span :style="{ width: `${contentHealth}%` }"></span>
            </div>
            <div class="dashboard-pills">
              <NuxtLink class="nav-link" to="/milestones">{{ activeTotals.milestones }} milestone aktif</NuxtLink>
              <NuxtLink class="nav-link" to="/education">{{ activeTotals.education }} materi publish</NuxtLink>
              <NuxtLink class="nav-link" to="/activities">{{ activeTotals.activities }} stimulasi publish</NuxtLink>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Quick Actions</h2>
                <p>Masuk langsung ke kontrol yang paling sering dipakai.</p>
              </div>
            </div>
            <div class="summary-list">
              <NuxtLink class="summary-row nav-link" to="/feedback-questions">
                <span>Atur pertanyaan feedback</span>
                <strong>{{ catalog.feedbackQuestions.length }}</strong>
              </NuxtLink>
              <NuxtLink class="summary-row nav-link" to="/feedback">
                <span>Lihat dan hapus feedback</span>
                <strong>{{ catalog.feedback.length }}</strong>
              </NuxtLink>
              <NuxtLink class="summary-row nav-link" to="/olah-data">
                <span>Olah data dan export</span>
                <strong>Open</strong>
              </NuxtLink>
            </div>
          </article>
        </section>

        <section class="analysis-grid">
          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Cakupan Rentang Usia</h2>
                <p>Total milestone, materi, dan stimulasi per rentang usia.</p>
              </div>
            </div>
            <div class="summary-list">
              <div v-for="age in ageCoverage" :key="age.label" class="summary-row">
                <span>{{ age.label }}</span>
                <strong>{{ age.total }}</strong>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Feedback Terbaru</h2>
                <p>Data terbaru dari aplikasi user.</p>
              </div>
            </div>
            <div class="summary-list">
              <NuxtLink v-for="item in recentFeedback" :key="item.id" class="summary-row nav-link" to="/feedback">
                <span>{{ item.respondentName }}</span>
                <strong>{{ formatDateTime(item.createdAt) }}</strong>
              </NuxtLink>
              <div v-if="!recentFeedback.length" class="state">Belum ada feedback.</div>
            </div>
          </article>
        </section>
      </section>
    </section>
  </main>
</template>
