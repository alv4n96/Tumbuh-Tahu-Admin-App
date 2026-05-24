<script setup lang="ts">
import {
  ArrowLeft,
  BarChart3,
  ClipboardCopy,
  Download,
  FileJson,
  Loader2,
  TableProperties
} from "lucide-vue-next";
import type { ApiResponse, CatalogState } from "~/types/admin";

type WijmoControlRow = {
  control: string;
  useCase: string;
  adminData: string;
  copyTarget: string;
};

const loading = ref(true);
const errorMessage = ref("");
const copied = ref("");
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

const wijmoControls: WijmoControlRow[] = [
  {
    control: "FlexGrid",
    useCase: "Pusat edit tabel, sort, filter, copy paste, dan export CSV.",
    adminData: "Milestones, Materi Edukasi, Stimulasi, Pertanyaan Feedback",
    copyTarget: "CSV template dan CSV hasil filter"
  },
  {
    control: "CollectionView",
    useCase: "Layer data untuk filter, paging, grouping, dan validasi sebelum simpan.",
    adminData: "Semua katalog yang dibaca dari Supabase",
    copyTarget: "JSON state per kategori"
  },
  {
    control: "FlexChart",
    useCase: "Grafik tren atau komposisi data untuk dashboard pengolahan.",
    adminData: "Jumlah konten per rentang usia dan rata-rata feedback",
    copyTarget: "CSV ringkasan chart"
  },
  {
    control: "PivotGrid",
    useCase: "Analisis silang per age range, kategori milestone, dan status publish.",
    adminData: "Milestones, Education, Activities",
    copyTarget: "Tabel rekap pivot"
  },
  {
    control: "InputDate/InputNumber/ComboBox",
    useCase: "Editor field yang konsisten untuk tanggal, angka, role, kategori, dan rentang usia.",
    adminData: "Form tambah/edit data admin",
    copyTarget: "Preset kontrol form"
  }
];

const ageRangeSummary = computed(() =>
  catalog.ageRanges.map((age) => ({
    ageRange: age.label,
    milestones: catalog.milestones.filter((item) => item.ageRange === age.label).length,
    education: catalog.education.filter((item) => item.ageRange === age.label).length,
    activities: catalog.activities.filter((item) => item.ageRange === age.label).length
  }))
);

const feedbackSummary = computed(() => {
  const fields = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"];
  return fields.map((field, index) => {
    const values = catalog.feedback.map((row) => Number((row as unknown as Record<string, number>)[field] || 0)).filter(Boolean);
    const average = values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
    const question = catalog.feedbackQuestions[index];
    return {
      question: question?.label ?? field.toUpperCase(),
      average: Number(average.toFixed(2)),
      responses: values.length
    };
  });
});

const processingExample = computed(() => ({
  generatedAt: new Date().toISOString(),
  totals: {
    ageRanges: catalog.ageRanges.length,
    milestones: catalog.milestones.length,
    education: catalog.education.length,
    activities: catalog.activities.length,
    feedbackQuestions: catalog.feedbackQuestions.length,
    feedbackResponses: catalog.feedback.length,
    users: catalog.users.length
  },
  active: {
    ageRanges: catalog.ageRanges.filter((item) => item.active).length,
    milestones: catalog.milestones.filter((item) => item.active).length,
    education: catalog.education.filter((item) => item.published).length,
    activities: catalog.activities.filter((item) => item.published).length,
    feedbackQuestions: catalog.feedbackQuestions.filter((item) => item.active).length
  },
  byAgeRange: ageRangeSummary.value,
  feedbackAverage: feedbackSummary.value
}));

const processingJson = computed(() => JSON.stringify(processingExample.value, null, 2));
const controlCsv = computed(() => {
  const header = "control,useCase,adminData,copyTarget";
  const rows = wijmoControls.map((row) => [row.control, row.useCase, row.adminData, row.copyTarget].map(csvCell).join(","));
  return [header, ...rows].join("\n");
});

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
    errorMessage.value = error instanceof Error ? error.message : "Gagal memuat data.";
  } finally {
    loading.value = false;
  }
}

async function copyText(value: string, label: string) {
  await navigator.clipboard.writeText(value);
  copied.value = label;
  window.setTimeout(() => {
    if (copied.value === label) {
      copied.value = "";
    }
  }, 1800);
}

function downloadText(value: string, filename: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([value], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}
</script>

<template>
  <main class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">TT</span>
        <div>
          <strong>Tumbuh Tahu</strong>
          <small>Data Processing</small>
        </div>
      </div>

      <nav class="nav-list" aria-label="Admin navigation">
        <NuxtLink class="nav-item nav-link" to="/">
          <ArrowLeft :size="18" />
          <span>Admin Control</span>
        </NuxtLink>
        <button class="nav-item active" type="button">
          <BarChart3 :size="18" />
          <span>Olah Data</span>
        </button>
      </nav>

      <div class="access-panel">
        <TableProperties :size="18" />
        <div>
          <strong>Wijmo-ready</strong>
          <small>Grid, pivot, chart, copy</small>
        </div>
      </div>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <div>
          <p class="eyebrow">Business Analytics App</p>
          <h1>Olah Data</h1>
        </div>
        <div class="topbar-actions">
          <button class="icon-button" type="button" title="Copy JSON" @click="copyText(processingJson, 'JSON')">
            <ClipboardCopy :size="18" />
          </button>
          <button class="icon-button" type="button" title="Download JSON" @click="downloadText(processingJson, 'tumbuh-tahu-processing.json', 'application/json;charset=utf-8')">
            <FileJson :size="18" />
          </button>
        </div>
      </header>

      <div v-if="loading" class="state">
        <Loader2 class="spin" :size="22" />
        <span>Loading data</span>
      </div>

      <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>

      <section v-else class="analysis-layout">
        <section class="metric-grid" aria-label="Processing metrics">
          <article class="metric">
            <span>Total katalog</span>
            <strong>{{ processingExample.totals.milestones + processingExample.totals.education + processingExample.totals.activities }}</strong>
          </article>
          <article class="metric">
            <span>Feedback masuk</span>
            <strong>{{ processingExample.totals.feedbackResponses }}</strong>
          </article>
          <article class="metric">
            <span>Pertanyaan aktif</span>
            <strong>{{ processingExample.active.feedbackQuestions }}/{{ processingExample.totals.feedbackQuestions }}</strong>
          </article>
        </section>

        <section class="analysis-grid">
          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Wijmo Control List</h2>
                <p>Daftar kontrol yang bisa dijadikan pusat kontrol data admin.</p>
              </div>
              <div class="toolbar">
                <button class="icon-button" type="button" title="Copy CSV" @click="copyText(controlCsv, 'Control CSV')">
                  <ClipboardCopy :size="18" />
                </button>
                <button class="icon-button" type="button" title="Download CSV" @click="downloadText(controlCsv, 'wijmo-control-list.csv', 'text/csv;charset=utf-8')">
                  <Download :size="18" />
                </button>
              </div>
            </div>
            <div class="wijmo-grid">
              <table>
                <thead>
                  <tr>
                    <th>Control</th>
                    <th>Use Case</th>
                    <th>Admin Data</th>
                    <th>Copy Target</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in wijmoControls" :key="item.control">
                    <td>{{ item.control }}</td>
                    <td>{{ item.useCase }}</td>
                    <td>{{ item.adminData }}</td>
                    <td>{{ item.copyTarget }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Contoh Hasil Olah</h2>
                <p>Rekap cepat dari data Supabase yang sudah dibaca admin.</p>
              </div>
            </div>
            <div class="summary-list">
              <div v-for="row in ageRangeSummary" :key="row.ageRange" class="summary-row">
                <span>{{ row.ageRange }}</span>
                <strong>{{ row.milestones + row.education + row.activities }}</strong>
              </div>
            </div>
          </article>
        </section>

        <section class="analysis-grid">
          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Rata-rata Feedback</h2>
                <p>Contoh agregasi q1-q10 berdasarkan label pertanyaan aktif.</p>
              </div>
            </div>
            <div class="wijmo-grid">
              <table>
                <thead>
                  <tr>
                    <th>Pertanyaan</th>
                    <th>Average</th>
                    <th>Responses</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in feedbackSummary" :key="item.question">
                    <td>{{ item.question }}</td>
                    <td>{{ item.average }}</td>
                    <td>{{ item.responses }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Copy JSON</h2>
                <p>Contoh payload siap ditempel ke file laporan atau spreadsheet tool.</p>
              </div>
              <button class="icon-button" type="button" title="Copy JSON" @click="copyText(processingJson, 'JSON')">
                <ClipboardCopy :size="18" />
              </button>
            </div>
            <textarea class="copy-box" :value="processingJson" readonly />
            <p v-if="copied" class="import-result">Copied: {{ copied }}</p>
          </article>
        </section>
      </section>
    </section>
  </main>
</template>
