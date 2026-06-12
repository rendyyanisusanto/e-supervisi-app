<script setup lang="ts">
import { computed } from 'vue';
import type { SupervisionItem } from '../../types/supervision';
import ScoreButtonGroup from './ScoreButtonGroup.vue';
import Textarea from 'primevue/textarea';
import Tag from 'primevue/tag';
import { getItemStatus } from '../../utils/score';

const props = defineProps<{
  item: SupervisionItem;
}>();

const emit = defineEmits<{
  (e: 'update:item', value: SupervisionItem): void;
}>();

const localItem = computed({
  get: () => props.item,
  set: (val) => emit('update:item', val)
});

const onScoreChange = (score: number) => {
  localItem.value.score = score;
  localItem.value.itemStatus = getItemStatus(score, localItem.value.maxScore);
};

const needsNote = computed(() => {
  return localItem.value.score !== null && localItem.value.score < localItem.value.maxScore;
});

const statusSeverity = computed(() => {
  if (!localItem.value.itemStatus) return 'secondary';
  const status = localItem.value.itemStatus.toLowerCase();
  if (status.includes('optimal')) return 'success';
  if (status.includes('baik')) return 'info';
  if (status.includes('cukup')) return 'warning';
  return 'danger';
});
</script>

<template>
  <div class="border border-gray-200 rounded-xl p-5 mb-4 hover:border-blue-300 transition-colors bg-white shadow-sm">
    <div class="flex justify-between items-start gap-4 mb-4">
      <div class="flex gap-3">
        <div class="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded shrink-0 h-min">
          {{ localItem.itemCode }}
        </div>
        <div class="text-gray-800 font-medium leading-relaxed">
          {{ localItem.itemDescription }}
        </div>
      </div>
      <div v-if="localItem.itemStatus">
        <Tag :value="localItem.itemStatus" :severity="statusSeverity" class="whitespace-nowrap" />
      </div>
    </div>

    <div class="pl-0 md:pl-14 flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-semibold text-gray-600">Skor (0 - {{ localItem.maxScore }})</label>
        <ScoreButtonGroup 
          :maxScore="localItem.maxScore" 
          :modelValue="localItem.score" 
          @update:modelValue="onScoreChange"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-semibold text-gray-600 flex justify-between">
          <span>Catatan</span>
          <span v-if="needsNote" class="text-orange-500 text-xs font-normal">Disarankan mengisi catatan untuk skor belum maksimal</span>
        </label>
        <Textarea 
          v-model="localItem.note" 
          rows="2" 
          placeholder="Tuliskan catatan, bukti fisik, atau temuan jika diperlukan..." 
          class="w-full"
          :class="{'border-orange-300 focus:border-orange-500': needsNote && !localItem.note}"
        />
      </div>
    </div>
  </div>
</template>
