<script setup lang="ts">
defineProps<{
  totalRows: number;
  activeRows: number;
  activeLabel: string;
  filteredRows: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  sectionLabel: string;
}>();
</script>

<template>
  <section class="metric-grid metric-grid-compact" aria-label="Page metrics">
    <article class="metric">
      <span>Total data</span>
      <strong>{{ totalRows }}</strong>
      <small>{{ sectionLabel }}</small>
    </article>
    <article class="metric">
      <span>{{ activeLabel }}</span>
      <strong>{{ activeRows }}</strong>
      <small>Status utama list</small>
    </article>
    <article class="metric">
      <span>Terfilter</span>
      <strong>{{ filteredRows }}</strong>
      <small>Hasil filter kolom</small>
    </article>
    <article class="metric">
      <span>Halaman</span>
      <strong>{{ currentPage }}/{{ totalPages }}</strong>
      <small>{{ pageSize }} data per halaman</small>
    </article>
  </section>
</template>
