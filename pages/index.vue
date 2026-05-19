<script setup lang="ts">
import {
  Activity,
  BookOpen,
  CheckCircle2,
  Download,
  LayoutDashboard,
  Loader2,
  LogOut,
  Plus,
  Search,
  Shield,
  Trash2,
  Upload,
  Users
} from "lucide-vue-next";
import type { Component } from "vue";
import type {
  AdminUser,
  ApiResponse,
  CatalogCategory,
  CatalogRecord,
  CatalogState,
  ImportResult
} from "~/types/admin";

type SectionConfig = {
  key: CatalogCategory;
  label: string;
  description: string;
  fields: string[];
  icon: Component;
};

const sections: SectionConfig[] = [
  {
    key: "milestones",
    label: "Milestones",
    description: "Kontrol checklist perkembangan anak.",
    fields: ["id", "slug", "label", "category", "ageRange", "minAgeMonths", "maxAgeMonths", "critical", "active", "displayOrder"],
    icon: CheckCircle2
  },
  {
    key: "education",
    label: "Materi Edukasi",
    description: "Konten baca yang muncul di aplikasi user.",
    fields: ["id", "title", "ageRange", "duration", "summary", "content", "published", "displayOrder"],
    icon: BookOpen
  },
  {
    key: "activities",
    label: "Stimulasi",
    description: "Aktivitas harian untuk orang tua.",
    fields: ["id", "title", "ageRange", "duration", "description", "published", "displayOrder"],
    icon: Activity
  },
  {
    key: "ageRanges",
    label: "Rentang Usia",
    description: "Master data segmentasi usia.",
    fields: ["id", "label", "minAgeMonths", "maxAgeMonths", "active", "displayOrder"],
    icon: LayoutDashboard
  },
  {
    key: "adminUsers",
    label: "Admin Users",
    description: "Akses multi-admin dan role awal.",
    fields: ["id", "email", "fullName", "role", "active"],
    icon: Users
  }
];

const activeCategory = ref<CatalogCategory>("milestones");
const search = ref("");
const loading = ref(true);
const saving = ref(false);
const importResult = ref<ImportResult | null>(null);
const errorMessage = ref("");
const catalog = reactive<CatalogState>({
  milestones: [],
  education: [],
  activities: [],
  ageRanges: [],
  adminUsers: []
});
const form = reactive<Record<string, any>>({});

const activeSection = computed(() => sections.find((section) => section.key === activeCategory.value) || sections[0]);
const activeRows = computed(() => {
  const query = search.value.toLowerCase().trim();
  const rows = catalog[activeCategory.value] as CatalogRecord[];
  if (!query) {
    return rows;
  }

  return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query));
});
const visibleFields = computed(() => activeSection.value.fields);
const totalPublished = computed(() =>
  catalog.milestones.filter((item) => item.active).length +
  catalog.education.filter((item) => item.published).length +
  catalog.activities.filter((item) => item.published).length
);
const adminSummary = computed(() => {
  const active = catalog.adminUsers.filter((user: AdminUser) => user.active).length;
  return `${active}/${catalog.adminUsers.length} aktif`;
});

onMounted(loadCatalog);
watch(activeCategory, () => {
  importResult.value = null;
  errorMessage.value = "";
  resetForm();
});

async function loadCatalog() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const response = await $fetch<ApiResponse<CatalogState>>("/api/admin/catalog");
    if (response.Error || !response.Data) {
      throw new Error(String(response.Error || "Failed to load catalog"));
    }
    Object.assign(catalog, response.Data);
    resetForm();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Gagal memuat data.";
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  for (const key of Object.keys(form)) {
    delete form[key];
  }

  for (const field of activeSection.value.fields) {
    form[field] = defaultValue(field);
  }
}

function defaultValue(field: string) {
  if (["active", "published", "critical"].includes(field)) {
    return true;
  }
  if (["minAgeMonths", "maxAgeMonths", "displayOrder"].includes(field)) {
    return 0;
  }
  if (field === "ageRange" || field === "label") {
    return "6-12 bln";
  }
  if (field === "category") {
    return "Motorik Kasar";
  }
  if (field === "role") {
    return "admin";
  }
  return "";
}

function editRow(row: CatalogRecord) {
  resetForm();
  Object.assign(form, row);
}

async function saveRow() {
  saving.value = true;
  errorMessage.value = "";
  try {
    const id = String(form.id || "");
    const url = id ? `/api/admin/${activeCategory.value}/${encodeURIComponent(id)}` : `/api/admin/${activeCategory.value}`;
    const method = id ? "PUT" : "POST";
    const response = await $fetch<ApiResponse<CatalogRecord>>(url, { method, body: form });
    if (response.Error) {
      throw new Error(String(response.Error));
    }
    await loadCatalog();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Gagal menyimpan data.";
  } finally {
    saving.value = false;
  }
}

async function deleteRow(row: CatalogRecord) {
  saving.value = true;
  try {
    const response = await $fetch<ApiResponse<{ id: string }>>(`/api/admin/${activeCategory.value}/${encodeURIComponent(row.id)}`, {
      method: "DELETE"
    });
    if (response.Error) {
      throw new Error(String(response.Error));
    }
    await loadCatalog();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Gagal menghapus data.";
  } finally {
    saving.value = false;
  }
}

function downloadTemplate() {
  window.location.href = `/api/admin/${activeCategory.value}/template`;
}

async function handleImport(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    return;
  }

  const text = await file.text();
  const rows = parseCsv(text);
  saving.value = true;
  try {
    const response = await $fetch<ApiResponse<ImportResult>>(`/api/admin/${activeCategory.value}/bulk`, {
      method: "POST",
      body: { rows }
    });
    if (response.Error || !response.Data) {
      throw new Error(String(response.Error || "Import failed"));
    }
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
  return lines
    .filter(Boolean)
    .map((line) => {
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
        <button
          v-for="section in sections"
          :key="section.key"
          class="nav-item"
          :class="{ active: activeCategory === section.key }"
          type="button"
          @click="activeCategory = section.key"
        >
          <component :is="section.icon" :size="18" />
          <span>{{ section.label }}</span>
        </button>
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
          <h1>Admin Panel</h1>
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

      <section class="metric-grid" aria-label="Admin metrics">
        <article class="metric">
          <span>Total Kontrol</span>
          <strong>{{ catalog.milestones.length + catalog.education.length + catalog.activities.length }}</strong>
        </article>
        <article class="metric">
          <span>Published/Active</span>
          <strong>{{ totalPublished }}</strong>
        </article>
        <article class="metric">
          <span>Admin Users</span>
          <strong>{{ adminSummary }}</strong>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel table-panel">
          <div class="panel-header">
            <div>
              <h2>{{ activeSection.label }}</h2>
              <p>{{ activeSection.description }}</p>
            </div>
            <div class="toolbar">
              <button class="icon-button" type="button" title="Download template" @click="downloadTemplate">
                <Download :size="18" />
              </button>
              <label class="icon-button" title="Bulk import">
                <Upload :size="18" />
                <input class="sr-only" type="file" accept=".csv" @change="handleImport" />
              </label>
            </div>
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
                  <th v-for="field in visibleFields.slice(0, 6)" :key="field">{{ field }}</th>
                  <th aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in activeRows" :key="row.id" @click="editRow(row)">
                  <td v-for="field in visibleFields.slice(0, 6)" :key="field">
                    {{ (row as Record<string, unknown>)[field] }}
                  </td>
                  <td>
                    <button class="danger-button" type="button" title="Delete" @click.stop="deleteRow(row)">
                      <Trash2 :size="16" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <aside class="panel form-panel">
          <div class="panel-header">
            <div>
              <h2>Control Handle</h2>
              <p>Create or update {{ activeSection.label.toLowerCase() }}</p>
            </div>
            <button class="icon-button" type="button" title="Reset form" @click="resetForm">
              <Plus :size="18" />
            </button>
          </div>

          <form class="record-form" @submit.prevent="saveRow">
            <label v-for="field in visibleFields" :key="field">
              <span>{{ field }}</span>
              <select v-if="field === 'category'" v-model="form[field]">
                <option>Motorik Kasar</option>
                <option>Motorik Halus</option>
                <option>Bahasa</option>
                <option>Sosial & Kemandirian</option>
              </select>
              <select v-else-if="field === 'ageRange' || field === 'label'" v-model="form[field]">
                <option v-for="age in catalog.ageRanges" :key="age.id">{{ age.label }}</option>
              </select>
              <select v-else-if="field === 'role'" v-model="form[field]">
                <option>owner</option>
                <option>admin</option>
                <option>editor</option>
              </select>
              <input v-else-if="['active', 'published', 'critical'].includes(field)" v-model="form[field]" type="checkbox" />
              <input v-else-if="['minAgeMonths', 'maxAgeMonths', 'displayOrder'].includes(field)" v-model.number="form[field]" type="number" />
              <textarea v-else-if="['summary', 'content', 'description'].includes(field)" v-model="form[field]" rows="3" />
              <input v-else v-model="form[field]" type="text" />
            </label>

            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <div v-if="importResult" class="import-result">
              Import: {{ importResult.success }} sukses, {{ importResult.failed }} gagal dari {{ importResult.total }} row
            </div>
            <button class="primary-button" type="submit" :disabled="saving">
              <Loader2 v-if="saving" class="spin" :size="18" />
              <span>{{ saving ? "Saving" : "Save Control" }}</span>
            </button>
          </form>
        </aside>
      </section>
    </section>
  </main>
</template>
