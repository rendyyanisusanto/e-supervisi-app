<template>
  <div class="relative mb-6">
    <!-- Fade overlays to indicate scrollability -->
    <div class="absolute left-0 top-0 bottom-3 w-4 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
    <div class="absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
    
    <div class="flex gap-3 pb-3 overflow-x-auto custom-scrollbar scroll-smooth px-1 pt-1">
      <button
        v-for="category in categories"
        :key="category"
        @click="emit('update:activeCategory', category)"
        class="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 flex items-center gap-2 border"
        :class="[
          activeCategory === category 
            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 shadow-sm'
        ]"
      >
        <i 
          v-if="activeCategory === category" 
          class="pi pi-check-circle text-white/90 text-sm"
        ></i>
        <i 
          v-else 
          class="pi pi-folder text-gray-400 text-sm"
        ></i>
        {{ category }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  categories: string[];
  activeCategory: string;
}>();

const emit = defineEmits<{
  (e: 'update:activeCategory', value: string): void;
}>();
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
