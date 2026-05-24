<script setup lang="ts">
import { Loader2, X } from "lucide-vue-next";
import type { AgeRangeRecord, ImportResult } from "~/types/admin";
import { booleanFields, numberFields, readonlyFields, textAreaFields } from "~/utils/catalogConfig";

defineProps<{
  ageRanges: AgeRangeRecord[];
  booleanFormFields: string[];
  errorMessage: string;
  form: Record<string, any>;
  importResult: ImportResult | null;
  saving: boolean;
  sectionLabel: string;
  standardFormFields: string[];
}>();

const emit = defineEmits<{
  close: [];
  save: [];
}>();

function formatFieldLabel(field: string) {
  return field.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (value) => value.toUpperCase());
}
</script>

<template>
  <div class="modal-backdrop" role="presentation" @click.self="emit('close')">
    <section class="modal-panel" role="dialog" aria-modal="true" :aria-label="`Form ${sectionLabel}`">
      <div class="panel-header">
        <div>
          <h2>Control Handle</h2>
          <p>Create or update {{ sectionLabel.toLowerCase() }}</p>
        </div>
        <button class="icon-button" type="button" title="Tutup modal" @click="emit('close')">
          <X :size="18" />
        </button>
      </div>

      <form class="record-form" @submit.prevent="emit('save')">
        <label v-for="field in standardFormFields" :key="field">
          <span>{{ formatFieldLabel(field) }}</span>
          <select v-if="field === 'category'" v-model="form[field]">
            <option>Motorik Kasar</option>
            <option>Motorik Halus</option>
            <option>Bahasa</option>
            <option>Sosial & Kemandirian</option>
          </select>
          <select v-else-if="field === 'ageRange'" v-model="form[field]">
            <option v-for="age in ageRanges" :key="age.id">{{ age.label }}</option>
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
</template>
