<script setup lang="ts">
import { ClipboardCopy, Download, Filter, Loader2, Plus, Trash2, Upload } from "lucide-vue-next";
import type { CatalogRecord } from "~/types/admin";
import { booleanFields, pageSizeOptions } from "~/utils/catalogConfig";

const props = defineProps<{
  activeRows: CatalogRecord[];
  canDeleteRows: boolean;
  columnFilters: Record<string, string>;
  currentPage: number;
  description: string;
  isReadOnlyCategory: boolean;
  loading: boolean;
  openFilterField: string;
  pageEnd: number;
  pageSize: number;
  pageStart: number;
  paginatedRows: CatalogRecord[];
  sectionActiveCount: number;
  sectionLabel: string;
  sectionSecondaryLabel: string;
  totalPages: number;
  visibleFields: string[];
}>();

const emit = defineEmits<{
  clearColumnFilters: [];
  clearSingleColumnFilter: [field: string];
  copyRows: [];
  deleteRow: [row: CatalogRecord];
  downloadTemplate: [];
  editRow: [row: CatalogRecord];
  exportRows: [];
  importRows: [event: Event];
  nextPage: [];
  openCreateModal: [];
  previousPage: [];
  toggleFilter: [field: string];
  "update:pageSize": [value: number];
}>();

function formatCell(value: unknown) {
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (!value) return "-";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  }
  return value;
}

function formatFieldLabel(field: string) {
  return field.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (value) => value.toUpperCase());
}

const activeFilterLabel = computed(() => (props.openFilterField ? formatFieldLabel(props.openFilterField) : ""));
</script>

<template>
  <section>
    <article class="panel table-panel">
      <div class="panel-header">
        <div>
          <h2>{{ sectionLabel }}</h2>
          <p>{{ description }}</p>
        </div>
        <div class="toolbar">
          <button v-if="!isReadOnlyCategory" class="icon-button" type="button" title="Tambah record" @click="emit('openCreateModal')">
            <Plus :size="18" />
          </button>
          <button class="icon-button" type="button" title="Download template" @click="emit('downloadTemplate')">
            <Download :size="18" />
          </button>
          <button class="icon-button" type="button" title="Export semua data" @click="emit('exportRows')">
            <Download :size="18" />
          </button>
          <button class="icon-button" type="button" title="Copy semua data" @click="emit('copyRows')">
            <ClipboardCopy :size="18" />
          </button>
          <label v-if="!isReadOnlyCategory" class="icon-button" title="Bulk import">
            <Upload :size="18" />
            <input class="sr-only" type="file" accept=".csv" @change="emit('importRows', $event)" />
          </label>
        </div>
      </div>

      <div class="table-control-row">
        <span>{{ sectionSecondaryLabel }}: {{ sectionActiveCount }}</span>
        <label>
          <span>Per halaman</span>
          <select :value="pageSize" @change="emit('update:pageSize', Number(($event.target as HTMLSelectElement).value))">
            <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
          </select>
        </label>
        <button class="pager-button" type="button" @click="emit('clearColumnFilters')">Clear filter</button>
      </div>

      <div v-if="openFilterField" class="filter-panel">
        <div>
          <strong>Filter {{ activeFilterLabel }}</strong>
          <small>Data akan berubah otomatis saat nilai diisi.</small>
        </div>
        <select v-if="booleanFields.includes(openFilterField)" v-model="columnFilters[openFilterField]" :aria-label="`Filter ${activeFilterLabel}`">
          <option value="">Semua</option>
          <option value="true">Ya</option>
          <option value="false">Tidak</option>
        </select>
        <input v-else v-model="columnFilters[openFilterField]" type="text" :aria-label="`Filter ${activeFilterLabel}`" placeholder="Ketik filter" />
        <button class="pager-button" type="button" @click="emit('clearSingleColumnFilter', openFilterField)">Clear</button>
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
                  <button class="filter-button" :class="{ active: Boolean(columnFilters[field]) || openFilterField === field }" type="button" :title="`Filter ${formatFieldLabel(field)}`" @click.stop="emit('toggleFilter', field)">
                    <Filter :size="14" />
                  </button>
                </div>
              </th>
              <th v-if="canDeleteRows" aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedRows" :key="row.id" :class="{ 'is-readonly': isReadOnlyCategory }" @click="emit('editRow', row)">
              <td v-for="field in visibleFields" :key="field">{{ formatCell((row as Record<string, unknown>)[field]) }}</td>
              <td v-if="canDeleteRows">
                <button class="danger-button" type="button" title="Delete" @click.stop="emit('deleteRow', row)">
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
          <button class="pager-button" type="button" :disabled="currentPage === 1" @click="emit('previousPage')">Prev</button>
          <span>Page {{ currentPage }} / {{ totalPages }}</span>
          <button class="pager-button" type="button" :disabled="currentPage === totalPages" @click="emit('nextPage')">Next</button>
        </div>
      </div>
    </article>
  </section>
</template>
