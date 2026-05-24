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
const totalContent = computed(() => contentTotals.value.milestones + contentTotals.value.education + contentTotals.value.activities + contentTotals.value.feedbackQuestions);
const activeContent = computed(() => activeTotals.value.milestones + activeTotals.value.education + activeTotals.value.activities + activeTotals.value.feedbackQuestions);
const inactiveContent = computed(() => Math.max(totalContent.value - activeContent.value, 0));
const averageFeedback = computed(() => {
  const values = catalog.feedback.flatMap((row) =>
    ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"].map((field) => Number((row as unknown as Record<string, number>)[field] || 0)).filter(Boolean)
  );
  return values.length ? (values.reduce((total, value) => total + value, 0) / values.length).toFixed(2) : "0";
});
const ratingPercent = computed(() => Math.round((Number(averageFeedback.value) / 5) * 100));
const ageCoverage = computed(() =>
  catalog.ageRanges.map((age, index) => {
    const total =
      catalog.milestones.filter((item) => item.ageRange === age.label).length +
      catalog.education.filter((item) => item.ageRange === age.label).length +
      catalog.activities.filter((item) => item.ageRange === age.label).length;
    const maxTotal = Math.max(
      1,
      ...catalog.ageRanges.map(
        (range) =>
          catalog.milestones.filter((item) => item.ageRange === range.label).length +
          catalog.education.filter((item) => item.ageRange === range.label).length +
          catalog.activities.filter((item) => item.ageRange === range.label).length
      )
    );
    return {
      label: age.label,
      total,
      percent: Math.round((total / maxTotal) * 100),
      color: ["#1f7a4d", "#2f80ed", "#f79009", "#7a5af8", "#d92d20", "#0e9384"][index % 6]
    };
  })
);
const contentReadyItems = computed(() => [
  { label: "Milestones", active: activeTotals.value.milestones, total: contentTotals.value.milestones, path: "/milestones", color: "#1f7a4d" },
  { label: "Materi", active: activeTotals.value.education, total: contentTotals.value.education, path: "/education", color: "#2f80ed" },
  { label: "Stimulasi", active: activeTotals.value.activities, total: contentTotals.value.activities, path: "/activities", color: "#f79009" },
  { label: "Feedback", active: activeTotals.value.feedbackQuestions, total: contentTotals.value.feedbackQuestions, path: "/feedback-questions", color: "#7a5af8" }
]);
const dashboardChart = computed(() =>
  contentReadyItems.value.map((item) => ({
    ...item,
    percent: item.total ? Math.round((item.active / item.total) * 100) : 0
  }))
);
const moduleDistribution = computed(() =>
  [
    { label: "Milestones", total: contentTotals.value.milestones, color: "#1f7a4d" },
    { label: "Materi", total: contentTotals.value.education, color: "#2f80ed" },
    { label: "Stimulasi", total: contentTotals.value.activities, color: "#f79009" },
    { label: "Feedback", total: contentTotals.value.feedbackQuestions, color: "#7a5af8" }
  ].map((item) => ({ ...item, percent: totalContent.value ? Math.round((item.total / totalContent.value) * 100) : 0 }))
);
const feedbackScoreBands = computed(() => {
  const scores = catalog.feedback.flatMap((row) =>
    ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"].map((field) => Number((row as unknown as Record<string, number>)[field] || 0)).filter(Boolean)
  );
  return [
    { label: "Setuju", total: scores.filter((score) => score >= 4).length, color: "#1f7a4d" },
    { label: "Netral", total: scores.filter((score) => score === 3).length, color: "#f79009" },
    { label: "Tidak setuju", total: scores.filter((score) => score <= 2).length, color: "#d92d20" }
  ].map((item) => ({ ...item, percent: scores.length ? Math.round((item.total / scores.length) * 100) : 0 }));
});
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
          <article class="metric metric-accent metric-green">
            <span>Konten Aktif</span>
            <strong>{{ activeContent }}</strong>
            <small>{{ inactiveContent }} draft/nonaktif perlu dicek</small>
          </article>
          <article class="metric metric-accent metric-blue">
            <span>Feedback Masuk</span>
            <strong>{{ catalog.feedback.length }}</strong>
            <small>Rata-rata rating {{ averageFeedback }}</small>
          </article>
          <article class="metric metric-accent metric-orange">
            <span>User Aplikasi</span>
            <strong>{{ catalog.users.length }}</strong>
            <small>{{ catalog.users.filter((item) => Boolean(item.lastLoginAt)).length }} pernah login</small>
          </article>
          <article class="metric metric-accent metric-purple">
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
                <p>Status modul yang siap tampil di aplikasi user.</p>
              </div>
              <strong>{{ contentHealth }}%</strong>
            </div>
            <div class="health-bar dashboard-health-bar" aria-hidden="true">
              <span :style="{ width: `${contentHealth}%` }"></span>
            </div>
            <div class="content-ready-list">
              <NuxtLink v-for="item in dashboardChart" :key="item.label" class="content-ready-item nav-link" :to="item.path" :style="{ '--item-color': item.color }">
                <span>
                  {{ item.label }}
                  <small>{{ item.active }} aktif dari {{ item.total }} data</small>
                </span>
                <strong>{{ item.percent }}%</strong>
              </NuxtLink>
            </div>
          </article>

          <article class="panel chart-panel">
            <div class="panel-header">
              <div>
                <h2>Rating Feedback</h2>
                <p>Rangkuman skala 1 sampai 5 dari pengguna.</p>
              </div>
            </div>
            <div class="donut-layout">
              <div class="donut-chart" :style="{ '--donut-value': `${ratingPercent}%` }">
                <strong>{{ averageFeedback }}</strong>
                <span>/5</span>
              </div>
              <div class="chart-list">
                <div v-for="item in feedbackScoreBands" :key="item.label" class="chart-row compact-chart-row" :style="{ '--chart-color': item.color }">
                  <span>{{ item.label }}</span>
                  <div class="chart-track" aria-hidden="true">
                    <span :style="{ width: `${item.percent}%` }"></span>
                  </div>
                  <strong>{{ item.percent }}%</strong>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section class="analysis-grid">
          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Komposisi Data</h2>
                <p>Perbandingan jumlah data per modul admin.</p>
              </div>
              <strong>{{ totalContent }}</strong>
            </div>
            <div class="chart-list">
              <div v-for="item in moduleDistribution" :key="item.label" class="chart-row" :style="{ '--chart-color': item.color }">
                <span>{{ item.label }}</span>
                <div class="chart-track" aria-hidden="true">
                  <span :style="{ width: `${item.percent}%` }"></span>
                </div>
                <strong>{{ item.total }}</strong>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Cakupan Rentang Usia</h2>
                <p>Total milestone, materi, dan stimulasi per rentang usia.</p>
              </div>
            </div>
            <div class="age-chart">
              <div v-for="age in ageCoverage" :key="age.label" class="age-bar" :style="{ '--chart-color': age.color }">
                <span>{{ age.label }}</span>
                <div class="age-track" aria-hidden="true">
                  <span :style="{ height: `${age.percent}%` }"></span>
                </div>
                <strong>{{ age.total }}</strong>
              </div>
            </div>
          </article>
        </section>

        <section class="analysis-grid">
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

          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Fokus Berikutnya</h2>
                <p>Prioritas konten yang perlu dicek admin.</p>
              </div>
            </div>
            <div class="summary-list">
              <div class="summary-row">
                <span>Draft/nonaktif</span>
                <strong>{{ inactiveContent }}</strong>
              </div>
              <NuxtLink class="summary-row nav-link" to="/feedback-questions">
                <span>Pertanyaan feedback</span>
                <strong>{{ activeTotals.feedbackQuestions }}/{{ contentTotals.feedbackQuestions }}</strong>
              </NuxtLink>
              <NuxtLink class="summary-row nav-link" to="/users">
                <span>User belum pernah login</span>
                <strong>{{ catalog.users.filter((item) => !item.lastLoginAt).length }}</strong>
              </NuxtLink>
            </div>
          </article>
        </section>
      </section>
    </section>
  </main>
</template>
