<script setup lang="ts">
import { computed } from 'vue';
import Avatar from 'primevue/avatar';

const props = defineProps<{
  name: string;
  subtitle?: string;
  imageUrl?: string;
  size?: 'normal' | 'large' | 'xlarge';
}>();

const getInitials = (name: string) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const avatarClass = computed(() => {
  return 'bg-blue-100 text-blue-600 font-semibold shrink-0';
});
</script>

<template>
  <div class="flex items-center gap-3">
    <Avatar 
      :image="imageUrl" 
      :label="!imageUrl ? getInitials(name) : undefined" 
      shape="circle" 
      :size="size || 'normal'" 
      :class="avatarClass" 
    />
    <div class="flex flex-col overflow-hidden">
      <span class="font-semibold text-slate-800 text-sm truncate">{{ name }}</span>
      <span v-if="subtitle" class="text-xs text-slate-500 truncate mt-0.5">{{ subtitle }}</span>
    </div>
  </div>
</template>
