<script setup lang="ts">
import type { CompetencyAspect } from '../../types/competency';

defineProps<{
  aspect: CompetencyAspect;
  type: 'strong' | 'weak' | 'normal';
}>();
</script>

<template>
  <div class="p-4 rounded-xl border flex items-center gap-4"
       :class="{
         'bg-green-50 border-green-200': type === 'strong',
         'bg-red-50 border-red-200': type === 'weak',
         'bg-white border-gray-200': type === 'normal'
       }">
    <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0"
         :class="{
           'bg-green-100 text-green-600': type === 'strong',
           'bg-red-100 text-red-600': type === 'weak',
           'bg-blue-100 text-blue-600': type === 'normal'
         }">
      <i class="pi" :class="{
        'pi-arrow-up': type === 'strong',
        'pi-arrow-down': type === 'weak',
        'pi-star': type === 'normal'
      }"></i>
    </div>
    
    <div class="flex-1 min-w-0">
      <h4 class="font-bold text-slate-800 truncate">{{ aspect.category }}</h4>
      <div class="text-sm text-slate-500 mt-0.5">Skor: {{ aspect.finalScore.toFixed(1) }} / 100</div>
    </div>

    <div class="text-right">
      <div class="font-bold" :class="{
        'text-green-600': type === 'strong',
        'text-red-600': type === 'weak',
        'text-slate-700': type === 'normal'
      }">{{ aspect.status }}</div>
    </div>
  </div>
</template>
