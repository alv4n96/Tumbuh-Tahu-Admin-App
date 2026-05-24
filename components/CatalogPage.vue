<script setup lang="ts">
import { LogOut } from "lucide-vue-next";
import type { CatalogCategory } from "~/types/admin";
import { booleanFields } from "~/utils/catalogConfig";

const props = defineProps<{ category: CatalogCategory }>();
const vm = useCatalogViewModel(props.category);

const standardFormFields = computed(() => vm.visibleFields.value.filter((field) => !booleanFields.includes(field)));
const booleanFormFields = computed(() => vm.visibleFields.value.filter((field) => booleanFields.includes(field)));

onMounted(vm.loadCatalog);

async function logout() {
  await $fetch("/api/admin/auth/logout", { method: "POST" });
  await navigateTo("/login");
}
</script>

<template>
  <main class="app-shell">
    <AdminSidebar :active-path="category" :admin-summary="vm.adminSummary.value" />

    <section class="workspace">
      <header class="topbar">
        <div>
          <p class="eyebrow">Business Analytics App</p>
          <h1>{{ vm.activeSection.value.label }}</h1>
        </div>
        <button class="icon-button" type="button" title="Logout" @click="logout">
          <LogOut :size="18" />
        </button>
      </header>

      <CatalogMetrics
        :active-label="vm.sectionSecondaryLabel.value"
        :active-rows="vm.sectionActiveCount.value"
        :current-page="vm.currentPage.value"
        :filtered-rows="vm.activeRows.value.length"
        :page-size="vm.pageSize.value"
        :section-label="vm.activeSection.value.label"
        :total-pages="vm.totalPages.value"
        :total-rows="vm.rawRows.value.length"
      />

      <CatalogTablePanel
        :active-rows="vm.activeRows.value"
        :can-delete-rows="vm.canDeleteRows.value"
        :column-filters="vm.columnFilters"
        :current-page="vm.currentPage.value"
        :description="vm.activeSection.value.description"
        :is-read-only-category="vm.isReadOnlyCategory.value"
        :loading="vm.loading.value"
        :open-filter-field="vm.openFilterField.value"
        :page-end="vm.pageEnd.value"
        :page-size="vm.pageSize.value"
        :page-start="vm.pageStart.value"
        :paginated-rows="vm.paginatedRows.value"
        :section-active-count="vm.sectionActiveCount.value"
        :section-label="vm.activeSection.value.label"
        :section-secondary-label="vm.sectionSecondaryLabel.value"
        :total-pages="vm.totalPages.value"
        :visible-fields="vm.visibleFields.value"
        @clear-column-filters="vm.clearColumnFilters"
        @clear-single-column-filter="vm.clearSingleColumnFilter"
        @copy-rows="vm.copyRows"
        @delete-row="vm.deleteRow"
        @download-template="vm.downloadTemplate"
        @edit-row="vm.editRow"
        @export-rows="vm.exportRows"
        @import-rows="vm.handleImport"
        @next-page="vm.nextPage"
        @open-create-modal="vm.openCreateModal"
        @previous-page="vm.previousPage"
        @toggle-filter="vm.toggleFilter"
        @update:page-size="vm.pageSize.value = $event"
      />
    </section>

    <CatalogFormModal
      v-if="vm.isFormModalOpen.value"
      :age-ranges="vm.catalog.ageRanges"
      :boolean-form-fields="booleanFormFields"
      :error-message="vm.errorMessage.value"
      :form="vm.form"
      :import-result="vm.importResult.value"
      :saving="vm.saving.value"
      :section-label="vm.activeSection.value.label"
      :standard-form-fields="standardFormFields"
      @close="vm.closeFormModal"
      @save="vm.saveRow"
    />
  </main>
</template>
