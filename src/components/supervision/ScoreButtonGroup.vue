<script setup lang="ts">
import Button from 'primevue/button';

const props = defineProps<{
  maxScore: number;
  modelValue: number | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const selectScore = (score: number) => {
  emit('update:modelValue', score);
};
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Button
      v-for="score in maxScore + 1"
      :key="score - 1"
      :label="(score - 1).toString()"
      :severity="modelValue === (score - 1) ? 'primary' : 'secondary'"
      :outlined="modelValue !== (score - 1)"
      @click="selectScore(score - 1)"
      class="w-12 h-12 !text-lg !font-bold rounded-lg"
    />
  </div>
</template>
