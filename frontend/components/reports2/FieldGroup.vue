<template>
  <div>
    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
      {{ title }}
    </div>
    <div class="space-y-1">
      <FieldPill
        v-for="field in fields"
        :key="field.id"
        :field="field"
      />
      <div v-if="fields.length === 0" class="text-xs text-gray-400 dark:text-gray-500 italic">
        No fields
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DataField } from '~/types/reporting'
import FieldPill from './FieldPill.vue'

defineProps<{
  title: string
  fields: DataField[]
}>()
</script>
