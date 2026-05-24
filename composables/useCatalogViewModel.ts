import type { AdminUser, ApiResponse, CatalogCategory, CatalogRecord, CatalogState, ImportResult } from "~/types/admin";
import { booleanFields, catalogSections, pageSizeOptions, readonlyCategories } from "~/utils/catalogConfig";

export function useCatalogViewModel(category: CatalogCategory) {
  const pageSize = ref(pageSizeOptions[0]);
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

  const activeSection = computed(() => catalogSections.find((section) => section.key === category) || catalogSections[0]);
  const visibleFields = computed(() => activeSection.value.fields);
  const rawRows = computed(() => catalog[category] as CatalogRecord[]);
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
  const isReadOnlyCategory = computed(() => readonlyCategories.includes(category));
  const canDeleteRows = computed(() => !isReadOnlyCategory.value || category === "feedback");
  const totalPages = computed(() => Math.max(1, Math.ceil(activeRows.value.length / pageSize.value)));
  const paginatedRows = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return activeRows.value.slice(start, start + pageSize.value);
  });
  const pageStart = computed(() => (activeRows.value.length ? (currentPage.value - 1) * pageSize.value + 1 : 0));
  const pageEnd = computed(() => Math.min(currentPage.value * pageSize.value, activeRows.value.length));
  const sectionActiveCount = computed(() => {
    if (category === "education") return catalog.education.filter((item) => item.published).length;
    if (category === "activities") return catalog.activities.filter((item) => item.published).length;
    if (category === "feedback") return catalog.feedback.filter((item) => averageFeedbackRating(item as Record<string, unknown>) >= 4).length;
    if (category === "users") return catalog.users.filter((item) => Boolean(item.lastLoginAt)).length;
    return (catalog[category] as CatalogRecord[]).filter((item) => Boolean((item as Record<string, unknown>).active)).length;
  });
  const sectionSecondaryLabel = computed(() => {
    if (category === "education" || category === "activities") return "Published";
    if (category === "feedback") return "Rating >= 4";
    if (category === "users") return "Pernah Login";
    return "Active";
  });
  const adminSummary = computed(() => {
    const active = catalog.adminUsers.filter((user: AdminUser) => user.active).length;
    return `${active}/${catalog.adminUsers.length} aktif`;
  });

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
    if (booleanFields.includes(field)) return true;
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

  function previousPage() {
    currentPage.value = Math.max(1, currentPage.value - 1);
  }

  function nextPage() {
    currentPage.value = Math.min(totalPages.value, currentPage.value + 1);
  }

  async function saveRow() {
    saving.value = true;
    errorMessage.value = "";
    try {
      const id = String(form.id || "");
      const url = id ? `/api/admin/${category}/${encodeURIComponent(id)}` : `/api/admin/${category}`;
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
      const response = await $fetch<ApiResponse<{ id: string }>>(`/api/admin/${category}/${encodeURIComponent(row.id)}`, { method: "DELETE" });
      if (response.Error) throw new Error(String(response.Error));
      await loadCatalog();
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "Gagal menghapus data.";
    } finally {
      saving.value = false;
    }
  }

  function downloadTemplate() {
    window.location.href = `/api/admin/${category}/template`;
  }

  function exportRows() {
    const blob = new Blob([buildCsvContent(rawRows.value)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${category}-export.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyRows() {
    await navigator.clipboard.writeText(buildCsvContent(rawRows.value));
  }

  async function handleImport(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const rows = parseCsv(await file.text());
    saving.value = true;
    try {
      const response = await $fetch<ApiResponse<ImportResult>>(`/api/admin/${category}/bulk`, { method: "POST", body: { rows } });
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

  function buildCsvContent(rows: CatalogRecord[]) {
    const header = visibleFields.value.join(",");
    const csvRows = rows.map((row) => visibleFields.value.map((field) => csvCell((row as Record<string, unknown>)[field])).join(","));
    return [header, ...csvRows].join("\n");
  }

  function parseCsv(text: string) {
    const [headerLine, ...lines] = text.trim().split(/\r?\n/);
    const headers = headerLine.split(",").map((item) => item.trim());
    return lines.filter(Boolean).map((line) => {
      const values = line.split(",").map((item) => item.trim());
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    });
  }

  return {
    activeRows,
    activeSection,
    adminSummary,
    canDeleteRows,
    catalog,
    clearColumnFilters,
    clearSingleColumnFilter,
    closeFormModal,
    columnFilters,
    copyRows,
    currentPage,
    deleteRow,
    downloadTemplate,
    editRow,
    errorMessage,
    exportRows,
    form,
    handleImport,
    importResult,
    isFormModalOpen,
    isReadOnlyCategory,
    loadCatalog,
    loading,
    nextPage,
    openCreateModal,
    openFilterField,
    pageEnd,
    pageSize,
    pageStart,
    paginatedRows,
    previousPage,
    rawRows,
    saveRow,
    saving,
    search,
    sectionActiveCount,
    sectionSecondaryLabel,
    toggleFilter,
    totalPages,
    visibleFields
  };
}

function averageFeedbackRating(row: Record<string, unknown>) {
  const values = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"].map((field) => Number(row[field] || 0)).filter((value) => value > 0);
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}
