<script setup lang="ts">
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCopy,
  Download,
  Filter,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  Upload,
  Users,
  X
} from "lucide-vue-next";
import type { Component } from "vue";
import type { AdminUser, ApiResponse, CatalogCategory, CatalogRecord, CatalogState, ImportResult } from "~/types/admin";

type SectionConfig = {
  key: CatalogCategory;
  path: string;
  label: string;
  description: string;
  fields: string[];
  icon: Component;
};

const props = defineProps<{ category: CatalogCategory }>();

const sections: SectionConfig[] = [
  { key: "milestones", path: "/milestones", label: "Milestones", description: "Kontrol checklist perkembangan anak.", fields: ["slug", "label", "category", "ageRange", "minAgeMonths", "maxAgeMonths", "critical", "active", "displayOrder"], icon: CheckCircle2 },
  { key: "education", path: "/education", label: "Materi Edukasi", description: "Konten baca yang muncul di aplikasi user.", fields: ["title", "ageRange", "duration", "summary", "content", "youtubeUrl", "published", "displayOrder"], icon: BookOpen },
  { key: "activities", path: "/activities", label: "Stimulasi", description: "Aktivitas harian untuk orang tua.", fields: ["title", "ageRange", "duration", "description", "published", "displayOrder"], icon: Activity },
  { key: "ageRanges", path: "/age-ranges", label: "Rentang Usia", description: "Master data segmentasi usia.", fields: ["label", "minAgeMonths", "maxAgeMonths", "active", "displayOrder"], icon: LayoutDashboard },
  { key: "feedbackQuestions", path: "/feedback-questions", label: "Pertanyaan Feedback", description: "Label, urutan, dan status pertanyaan rating di aplikasi.", fields: ["slug", "label", "active", "displayOrder"], icon: MessageSquare },
  { key: "adminUsers", path: "/admin-users", label: "Admin Users", description: "Akses admin, role, dan status login terakhir.", fields: ["email", "fullName", "role", "active", "lastLoginAt"], icon: Settings },
  { key: "users", path: "/users", label: "Users", description: "Daftar user aplikasi dan login terakhir.", fields: ["email", "fullName", "createdAt", "lastLoginAt"], icon: Users },
  { key: "feedback", path: "/feedback", label: "Feedback", description: "Masukan pengguna dari aplikasi utama.", fields: ["respondentName", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "createdAt"], icon: MessageSquare }
];

const pageSizeOptions = [10, 25, 50, 100];
const booleanFields = ["active", "published", "critical"];
const numberFields = ["minAgeMonths", "maxAgeMonths", "displayOrder", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"];
const textAreaFields = ["summary", "content", "description"];
const readonlyCategories: CatalogCategory[] = ["users", "feedback"];
const readonlyFields = ["lastLoginAt"];

const pageSize = ref(10);
const currentPage = ref(1);
const search = ref("");
const openFilterField = ref("");
const loading = ref(true);
const saving = ref(false);
const isFormModalOpen = ref(false);
const importResult = ref<ImportResult | null>(null);
const errorMessage = ref("");
const form = reactive<Record<string, any>>({});
const columnFilters = reactive<Record<string, string>>({});
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

const activeSection = computed(() => sections.find((section) => section.key === props.category) || sections[0]);
const visibleFields = computed(() => activeSection.value.fields);
const rawRows = computed(() => catalog[props.category] as CatalogRecord[]);
const activeRows = computed(() => {
  const query = search.value.toLowerCase().trim();
  let rows = rawRows.value;

  for (const column of visibleFields.value) {
    const value = String(columnFilters[column] ?? "").toLowerCase().trim();
    if (value) {
      rows = rows.filter((row) => String((row as Record<string, unknown>)[column] ?? "").toLowerCase().includes(value));
    }
  }

  return query ? rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query)) : rows;
});
const standardFormFields = computed(() => visibleFields.value.filter((field) => !booleanFields.includes(field)));
const booleanFormFields = computed(() => visibleFields.value.filter((field) => booleanFields.includes(field)));
const isReadOnlyCategory = computed(() => readonlyCategories.includes(props.category));
const canDeleteRows = computed(() => !isReadOnlyCategory.value || props.category === "feedback");
const totalPages = computed(() => Math.max(1, Math.ceil(activeRows.value.length / pageSize.value)));
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return activeRows.value.slice(start, start + pageSize.value);
});
const pageStart = computed(() => (activeRows.value.length ? (currentPage.value - 1) * pageSize.value + 1 : 0));
const pageEnd = computed(() => Math.min(currentPage.value * pageSize.value, activeRows.value.length));
const sectionActiveCount = computed(() => {
  if (props.category === "education") return catalog.education.filter((item) => item.published).length;
  if (props.category === "activities") return catalog.activities.filter((item) => item.published).length;
  if (props.category === "feedback") return catalog.feedback.filter((item) => averageFeedbackRating(item as Record<string, unknown>) >= 4).length;
  if (props.category === "users") return catalog.users.filter((item) => Boolean(item.lastLoginAt)).length;
  return (catalog[props.category] as CatalogRecord[]).filter((item) => Boolean((item as Record<string, unknown>).active)).length;
});
const sectionSecondaryLabel = computed(() => {
  if (props.category === "education" || props.category === "activities") return "Published";
  if (props.category === "feedback") return "Rating >= 4";
  if (props.category === "users") return "Pernah Login";
  return "Active";
});
const adminSummary = computed(() => {
  const active = catalog.adminUsers.filter((user: AdminUser) => user.active).length;
  return `${active}/${catalog.adminUsers.length} aktif`;
});

onMounted(loadCatalog);
watch([search, pageSize], () => {
  currentPage.value = 1;
});
watch(columnFilters, () => {
  currentPage.value = 1;
});
watch(totalPages, () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
});

async function loadCatalog() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const response = await $fetch<ApiResponse<CatalogState>>("/api/admin/catalog");
    if (response.Error || !response.Data) throw new Error(String(response.Error || "Failed to load catalog"));
    Object.assign(catalog, response.Data);
    resetForm();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Gagal memuat data.";
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  for (const key of Object.keys(form)) delete form[key];
  for (const field of visibleFields.value) form[field] = defaultValue(field);
}

function defaultValue(field: string) {
  if (["active", "published", "critical"].includes(field)) return true;
  if (["minAgeMonths", "maxAgeMonths", "displayOrder"].includes(field)) return 0;
  if (field === "ageRange") return "6-12 bln";
  if (field === "category") return "Motorik Kasar";
  if (field === "role") return "admin";
  if (/^q([1-9]|10)$/.test(field)) return 0;
  if (field === "createdAt") return new Date().toISOString();
  return "";
}

function openCreateModal() {
  if (isReadOnlyCategory.value) return;
  resetForm();
  isFormModalOpen.value = true;
}

function closeFormModal() {
  if (!saving.value) isFormModalOpen.value = false;
}

function editRow(row: CatalogRecord) {
  if (isReadOnlyCategory.value) return;
  resetForm();
  Object.assign(form, row);
  isFormModalOpen.value = true;
}

function formatCell(value: unknown) {
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (!value) return "-";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return formatDateTime(value);
  return value;
}

function formatFieldLabel(field: string) {
  return field.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (value) => value.toUpperCase());
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function averageFeedbackRating(row: Record<string, unknown>) {
  const values = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"].map((field) => Number(row[field] || 0)).filter((value) => value > 0);
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

function toggleFilter(field: string) {
  openFilterField.value = openFilterField.value === field ? "" : field;
}

function clearColumnFilters() {
  for (const key of Object.keys(columnFilters)) delete columnFilters[key];
  openFilterField.value = "";
}

function clearSingleColumnFilter(field: string) {
  delete columnFilters[field];
  openFilterField.value = "";
}

async function saveRow() {
  saving.value = true;
  errorMessage.value = "";
  try {
    const id = String(form.id || "");
    const url = id ? `/api/admin/${props.category}/${encodeURIComponent(id)}` : `/api/admin/${props.category}`;
    const response = await $fetch<ApiResponse<CatalogRecord>>(url, { method: id ? "PUT" : "POST", body: form });
    if (response.Error) throw new Error(String(response.Error));
    await loadCatalog();
    isFormModalOpen.value = false;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Gagal menyimpan data.";
  } finally {
    saving.value = false;
  }
}

async function deleteRow(row: CatalogRecord) {
  saving.value = true;
  try {
    const response = await $fetch<ApiResponse<{ id: string }>>(`/api/admin/${props.category}/${encodeURIComponent(row.id)}`, { method: "DELETE" });
    if (response.Error) throw new Error(String(response.Error));
    await loadCatalog();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Gagal menghapus data.";
  } finally {
    saving.value = false;
  }
}

function downloadTemplate() {
  window.location.href = `/api/admin/${props.category}/template`;
}

function exportRows() {
  const blob = new Blob([buildCsvContent(rawRows.value)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${props.category}-export.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

async function copyRows() {
  await navigator.clipboard.writeText(buildCsvContent(rawRows.value));
}

function buildCsvContent(rows: CatalogRecord[]) {
  const header = visibleFields.value.join(",");
  const csvRows = rows.map((row) => visibleFields.value.map((field) => csvCell((row as Record<string, unknown>)[field])).join(","));
  return [header, ...csvRows].join("\n");
}

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

async function handleImport(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const rows = parseCsv(await file.text());
  saving.value = true;
  try {
    const response = await $fetch<ApiResponse<ImportResult>>(`/api/admin/${props.category}/bulk`, { method: "POST", body: { rows } });
    if (response.Error || !response.Data) throw new Error(String(response.Error || "Import failed"));
    importResult.value = response.Data;
    await loadCatalog();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Gagal import data.";
  } finally {
    saving.value = false;
    input.value = "";
  }
}

function parseCsv(text: string) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((item) => item.trim());
  return lines.filter(Boolean).map((line) => {
    const values = line.split(",").map((item) => item.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

async function logout() {
  await $fetch("/api/admin/auth/logout", { method: "POST" });
  await navigateTo("/login");
}
</script>

<template>
  <main class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">TT</span>
        <div>
          <strong>Tumbuh Tahu</strong>
          <small>Admin Control</small>
        </div>
      </div>

      <nav class="nav-list" aria-label="Admin navigation">
        <NuxtLink class="nav-item nav-link" to="/">
          <BarChart3 :size="18" />
          <span>Dashboard</span>
        </NuxtLink>
        <NuxtLink v-for="section in sections" :key="section.key" class="nav-item nav-link" :class="{ active: category === section.key }" :to="section.path">
          <component :is="section.icon" :size="18" />
          <span>{{ section.label }}</span>
        </NuxtLink>
        <NuxtLink class="nav-item nav-link" to="/olah-data">
          <BarChart3 :size="18" />
          <span>Olah Data</span>
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

    <section class="workspace">
      <header class="topbar">
        <div>
          <p class="eyebrow">Business Analytics App</p>
          <h1>{{ activeSection.label }}</h1>
        </div>
        <div class="topbar-actions">
          <div class="search-box">
            <Search :size="18" />
            <input v-model="search" type="search" placeholder="Search catalog data" />
          </div>
          <button class="icon-button" type="button" title="Logout" @click="logout">
            <LogOut :size="18" />
          </button>
        </div>
      </header>

      <section class="metric-grid metric-grid-compact" aria-label="Page metrics">
        <article class="metric">
          <span>Total data</span>
          <strong>{{ rawRows.length }}</strong>
          <small>{{ activeSection.label }}</small>
        </article>
        <article class="metric">
          <span>{{ sectionSecondaryLabel }}</span>
          <strong>{{ sectionActiveCount }}</strong>
          <small>Status utama list</small>
        </article>
        <article class="metric">
          <span>Terfilter</span>
          <strong>{{ activeRows.length }}</strong>
          <small>Hasil search dan filter kolom</small>
        </article>
        <article class="metric">
          <span>Halaman</span>
          <strong>{{ currentPage }}/{{ totalPages }}</strong>
          <small>{{ pageSize }} data per halaman</small>
        </article>
      </section>

      <section>
        <article class="panel table-panel">
          <div class="panel-header">
            <div>
              <h2>{{ activeSection.label }}</h2>
              <p>{{ activeSection.description }}</p>
            </div>
            <div class="toolbar">
              <button v-if="!isReadOnlyCategory" class="icon-button" type="button" title="Tambah record" @click="openCreateModal">
                <Plus :size="18" />
              </button>
              <button class="icon-button" type="button" title="Download template" @click="downloadTemplate">
                <Download :size="18" />
              </button>
              <button class="icon-button" type="button" title="Export semua data" @click="exportRows">
                <Download :size="18" />
              </button>
              <button class="icon-button" type="button" title="Copy semua data" @click="copyRows">
                <ClipboardCopy :size="18" />
              </button>
              <label v-if="!isReadOnlyCategory" class="icon-button" title="Bulk import">
                <Upload :size="18" />
                <input class="sr-only" type="file" accept=".csv" @change="handleImport" />
              </label>
            </div>
          </div>

          <div class="table-control-row">
            <span>{{ sectionSecondaryLabel }}: {{ sectionActiveCount }}</span>
            <label>
              <span>Per halaman</span>
              <select v-model.number="pageSize">
                <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
              </select>
            </label>
            <button class="pager-button" type="button" @click="clearColumnFilters">Clear filter</button>
          </div>

          <div v-if="loading" class="state">
            <Loader2 class="spin" :size="22" />
            <span>Loading data</span>
          </div>

          <div v-else-if="!activeRows.length" class="state">
            <span>No data found</span>
          </div>

          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th v-for="field in visibleFields" :key="field">
                    <div class="th-control">
                      <span>{{ formatFieldLabel(field) }}</span>
                      <button class="filter-button" :class="{ active: Boolean(columnFilters[field]) || openFilterField === field }" type="button" :title="`Filter ${formatFieldLabel(field)}`" @click.stop="toggleFilter(field)">
                        <Filter :size="14" />
                      </button>
                      <div v-if="openFilterField === field" class="filter-popover">
                        <select v-if="booleanFields.includes(field)" v-model="columnFilters[field]" :aria-label="`Filter ${formatFieldLabel(field)}`">
                          <option value="">Semua</option>
                          <option value="true">Ya</option>
                          <option value="false">Tidak</option>
                        </select>
                        <input v-else v-model="columnFilters[field]" type="text" :aria-label="`Filter ${formatFieldLabel(field)}`" placeholder="Ketik filter" />
                        <button class="pager-button" type="button" @click="clearSingleColumnFilter(field)">Clear</button>
                      </div>
                    </div>
                  </th>
                  <th v-if="canDeleteRows" aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in paginatedRows" :key="row.id" :class="{ 'is-readonly': isReadOnlyCategory }" @click="editRow(row)">
                  <td v-for="field in visibleFields" :key="field">{{ formatCell((row as Record<string, unknown>)[field]) }}</td>
                  <td v-if="canDeleteRows">
                    <button class="danger-button" type="button" title="Delete" @click.stop="deleteRow(row)">
                      <Trash2 :size="16" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!loading && activeRows.length" class="pagination-bar">
            <span>Menampilkan {{ pageStart }}-{{ pageEnd }} dari {{ activeRows.length }}</span>
            <div class="pagination-actions">
              <button class="pager-button" type="button" :disabled="currentPage === 1" @click="currentPage = Math.max(1, currentPage - 1)">Prev</button>
              <span>Page {{ currentPage }} / {{ totalPages }}</span>
              <button class="pager-button" type="button" :disabled="currentPage === totalPages" @click="currentPage = Math.min(totalPages, currentPage + 1)">Next</button>
            </div>
          </div>
        </article>
      </section>
    </section>

    <div v-if="isFormModalOpen" class="modal-backdrop" role="presentation" @click.self="closeFormModal">
      <section class="modal-panel" role="dialog" aria-modal="true" :aria-label="`Form ${activeSection.label}`">
        <div class="panel-header">
          <div>
            <h2>Control Handle</h2>
            <p>Create or update {{ activeSection.label.toLowerCase() }}</p>
          </div>
          <button class="icon-button" type="button" title="Tutup modal" @click="closeFormModal">
            <X :size="18" />
          </button>
        </div>

        <form class="record-form" @submit.prevent="saveRow">
          <label v-for="field in standardFormFields" :key="field">
            <span>{{ formatFieldLabel(field) }}</span>
            <select v-if="field === 'category'" v-model="form[field]">
              <option>Motorik Kasar</option>
              <option>Motorik Halus</option>
              <option>Bahasa</option>
              <option>Sosial & Kemandirian</option>
            </select>
            <select v-else-if="field === 'ageRange'" v-model="form[field]">
              <option v-for="age in catalog.ageRanges" :key="age.id">{{ age.label }}</option>
            </select>
            <select v-else-if="field === 'role'" v-model="form[field]">
              <option>owner</option>
              <option>admin</option>
              <option>editor</option>
            </select>
            <input v-else-if="readonlyFields.includes(field)" v-model="form[field]" type="text" disabled />
            <input v-else-if="numberFields.includes(field)" v-model.number="form[field]" type="number" />
            <textarea v-else-if="textAreaFields.includes(field)" v-model="form[field]" rows="3" />
            <input v-else v-model="form[field]" type="text" />
          </label>

          <div v-if="booleanFormFields.length" class="checkbox-grid" aria-label="Status controls">
            <label v-for="field in booleanFormFields" :key="field" class="checkbox-field">
              <input v-model="form[field]" type="checkbox" />
              <span>{{ formatFieldLabel(field) }}</span>
            </label>
          </div>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <div v-if="importResult" class="import-result">Import: {{ importResult.success }} sukses, {{ importResult.failed }} gagal dari {{ importResult.total }} row</div>
          <button class="primary-button" type="submit" :disabled="saving">
            <Loader2 v-if="saving" class="spin" :size="18" />
            <span>{{ saving ? "Saving" : "Save Control" }}</span>
          </button>
        </form>
      </section>
    </div>
  </main>
</template>
